import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, of} from 'rxjs';
import {flatMap, map, tap} from 'rxjs/operators';
import {DavClient} from './dav-client';
import {Container} from './model/container';
import {DavResource} from './model/dav-resource';
import {File} from './model/file';
import {FileEditor} from './model/file-editor';


@Injectable({
  providedIn: 'root',
})
export class FileService {
  openRequests = new EventEmitter<FileEditor>();
  updates = new EventEmitter<File>();
  deletions = new EventEmitter<File>();

  currentFile = new BehaviorSubject<File | undefined>(undefined);

  constructor(
    private dav: DavClient,
  ) {
  }

  open(editor: FileEditor): void {
    this.openRequests.next(editor);
  }

  getContent(container: Container, file: File): Observable<string> {
    if (file.content) {
      return of(file.content);
    }

    return this.dav.get(`${container.url}/dav/${file.path}`).pipe(tap(content => {
      file.content = content;
    }));
  }

  saveContent(container: Container, file: File): Observable<void> {
    if (!file.content) {
      return EMPTY;
    }
    return this.dav.put(`${container.url}/dav/${file.path}`, file.content).pipe(tap(() => {
      file.dirty = false;
    }));
  }

  get(container: Container, path: string): Observable<File> {
    return this.dav.propFind(`${container.url}/dav/${path}`).pipe(map(resource => this.toFile(resource)));
  }

  getChildren(container: Container, parent: File): Observable<File[]> {
    if (parent.children) {
      return of(parent.children);
    }
    return this.dav.propFindChildren(`${container.url}/dav/${parent.path}`).pipe(map(childResources => {
      const children = childResources.map(resource => this.toFile(resource));

      children.sort(File.compare);

      for (const child of children) {
        child.parent = parent;
      }
      parent.children = children;

      return children;
    }));
  }

  createChild(container: Container, parent: File, name: string, directory: boolean): Observable<void> {
    const path = parent.path + name;
    const url = `${container.url}/dav/${path}`;
    return (directory ? this.dav.mkcol(url) : this.dav.put(url, ''));
  }

  rename(container: Container, file: File, newName: string): Observable<void> {
    const [start, end] = file._namePos;
    const from = `${container.url}/dav/${file.path}`;
    const to = `${container.url}/dav/${file.path.substring(0, start)}${newName}${file.path.substring(end)}`;
    return this.dav.move(from, to);
  }

  move(container: Container, file: File, directory: File): Observable<void> {
    const [start] = file._namePos;
    const from = `${container.url}/dav/${file.path}`;
    const to = `${container.url}/dav/${directory.path}${file.path.substring(start)}`;
    return this.dav.move(from, to);
  }

  delete(container: Container, file: File): Observable<void> {
    return this.dav.delete(`${container.url}/dav/${file.path}`);
  }

  resolve(file: File, path: string): File | undefined {
    if (file.path === path) {
      return file;
    }
    if (!file.children) {
      return undefined;
    }
    for (const child of file.children) {
      const childResult = this.resolve(child, path);
      if (childResult) {
        return childResult;
      }
    }
    return undefined;
  }

  private toFile(resource: DavResource): File {
    const file = new File();
    file.path = resource.href.substring('/dav'.length);
    file.modified = resource.modified;
    return file;
  }
}
