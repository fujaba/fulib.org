import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Container} from './model/container';
import {File} from './model/file';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(
    private http: HttpClient,
  ) {
  }

  private toFile(doc: Document): File {
    const file = new File();
    const responseNode = doc.createExpression('/D:multistatus/D:response[1]', () => 'DAV:')
      .evaluate(doc, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
    if (responseNode) {
      this.copyToFile(doc, responseNode, file);
    }
    return file;
  }

  private toChildFiles(doc: Document): File[] {
    const responseNodes = doc.createExpression('/D:multistatus/D:response', () => 'DAV:')
      .evaluate(doc, XPathResult.ORDERED_NODE_ITERATOR_TYPE);

    const children: File[] = [];
    responseNodes.iterateNext();
    let responseNode = responseNodes.iterateNext();
    while (responseNode) {
      const file = new File();
      this.copyToFile(doc, responseNode, file);
      children.push(file);
      responseNode = responseNodes.iterateNext();
    }

    return children;
  }

  private copyToFile(doc: Document, responseNode: Node, file: File): void {
    const href = doc.evaluate('./D:href/text()', responseNode, () => 'DAV:', XPathResult.STRING_TYPE).stringValue;
    file.path = href.substring('/dav'.length);
    const modified = doc.createExpression('./D:propstat/D:prop/D:getlastmodified/text()', () => 'DAV:')
      .evaluate(responseNode, XPathResult.STRING_TYPE).stringValue;
    file.modified = new Date(modified);
  }

  createDirectory(container: Container, path: string): Observable<void> {
    return this.http.request<void>('MKCOL', `${container.url}/dav/${path}`);
  }

  get(container: Container, path: string): Observable<File> {
    return this.http.request('PROPFIND', `${container.url}/dav/${path}`, {responseType: 'text'}).pipe(
      map(text => new DOMParser().parseFromString(text, 'text/xml')),
      map(document => this.toFile(document)),
    );
  }

  getChildren(container: Container, path: string): Observable<File[]> {
    return this.http.request('PROPFIND', `${container.url}/dav/${path}`, {
      responseType: 'text',
      headers: {Depth: '1'},
    }).pipe(
      map(text => new DOMParser().parseFromString(text, 'text/xml')),
      map(doc => this.toChildFiles(doc)),
    );
  }

  delete(container: Container, path: string): Observable<void> {
    return this.http.delete<void>(`${container.url}/dav/${path}`);
  }

  move(container: Container, from: string, to: string): Observable<void> {
    return this.http.request<void>('MOVE', `${container.url}/dav/${from}`, {
      headers: {Destination: `${container.url}/dav/${to}`},
    });
  }

  download(container: Container, path: string): Observable<string> {
    return this.http.get(`${container.url}/dav/${path}`, {responseType: 'text'});
  }

  upload(container: Container, path: string, content: string): Observable<void> {
    return this.http.put<void>(`${container.url}/dav/${path}`, content);
  }
}
