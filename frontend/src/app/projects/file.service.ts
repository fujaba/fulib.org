import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DavResource} from './model/dav-resource';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(
    private http: HttpClient,
  ) {
  }

  private toResource(doc: Document): DavResource {
    const file = new DavResource();
    const responseNode = doc.createExpression('/D:multistatus/D:response[1]', () => 'DAV:')
      .evaluate(doc, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
    if (responseNode) {
      this.copyToResource(doc, responseNode, file);
    }
    return file;
  }

  private toChildResources(doc: Document): DavResource[] {
    const responseNodes = doc.createExpression('/D:multistatus/D:response', () => 'DAV:')
      .evaluate(doc, XPathResult.ORDERED_NODE_ITERATOR_TYPE);

    const children: DavResource[] = [];
    responseNodes.iterateNext();
    let responseNode = responseNodes.iterateNext();
    while (responseNode) {
      const resource = new DavResource();
      this.copyToResource(doc, responseNode, resource);
      children.push(resource);
      responseNode = responseNodes.iterateNext();
    }

    return children;
  }

  private copyToResource(doc: Document, responseNode: Node, resource: DavResource): void {
    resource.href = doc.evaluate('./D:href/text()', responseNode, () => 'DAV:', XPathResult.STRING_TYPE).stringValue;
    resource.modified = new Date(doc.evaluate('./D:propstat/D:prop/D:getlastmodified/text()', responseNode, () => 'DAV:',
      XPathResult.STRING_TYPE).stringValue);
  }

  createDirectory(url: string): Observable<void> {
    return this.http.request<void>('MKCOL', url);
  }

  get(url: string): Observable<DavResource> {
    return this.http.request('PROPFIND', url, {responseType: 'text'}).pipe(
      map(text => new DOMParser().parseFromString(text, 'text/xml')),
      map(document => this.toResource(document)),
    );
  }

  getChildren(url: string): Observable<DavResource[]> {
    return this.http.request('PROPFIND', url, {
      responseType: 'text',
      headers: {Depth: '1'},
    }).pipe(
      map(text => new DOMParser().parseFromString(text, 'text/xml')),
      map(doc => this.toChildResources(doc)),
    );
  }

  delete(url: string): Observable<void> {
    return this.http.delete<void>(url);
  }

  move(from: string, to: string): Observable<void> {
    return this.http.request<void>('MOVE', from, {
      headers: {Destination: to},
    });
  }

  download(url: string): Observable<string> {
    return this.http.get(url, {responseType: 'text'});
  }

  upload(url: string, content: string): Observable<void> {
    return this.http.put<void>(url, content);
  }
}
