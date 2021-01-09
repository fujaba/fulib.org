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
    private fileService: DavClient,
  ) {
  }

  open(editor: FileEditor): void {
    this.openRequests.next(editor);
  }

  getContent(container: Container, file: File): Observable<string> {
    if (file.content) {
      return of(file.content);
    }

    return this.fileService.get(`${container.url}/dav/${file.path}`).pipe(tap(content => {
      file.content = content;
    }));
  }

  saveContent(container: Container, file: File): Observable<void> {
    if (!file.content) {
      return EMPTY;
    }
    return this.fileService.put(`${container.url}/dav/${file.path}`, file.content).pipe(tap(() => {
      file.dirty = false;
    }));
  }

  get(container: Container, path: string): Observable<File> {
    return this.fileService.propFind(`${container.url}/dav/${path}`).pipe(map(resource => this.toFile(resource)));
  }

  getChildren(container: Container, parent: File): Observable<File[]> {
    if (parent.children) {
      return of(parent.children);
    }
    return this.fileService.propFindChildren(`${container.url}/dav/${parent.path}`).pipe(map(childResources => {
      const children = childResources.map(resource => this.toFile(resource));

      children.sort(File.compare);

      for (const child of children) {
        child.parent = parent;
      }
      parent.children = children;

      return children;
    }));
  }

  createChild(container: Container, parent: File, name: string, directory: boolean): Observable<File> {
    const path = parent.path + name;
    const url = `${container.url}/dav/${path}`;
    return (directory ? this.fileService.mkcol(url) : this.fileService.put(url, '')).pipe(
      flatMap(() => this.fileService.propFind(url)),
      map(resource => {
        const file = this.toFile(resource);
        this.setParent(file, parent);
        return file;
      }),
    );
  }

  rename(container: Container, file: File, newName: string): Observable<void> {
    const [start, end] = file._namePos;
    const from = `${container.url}/dav/${file.path}`;
    const to = `${container.url}/dav/${file.path.substring(0, start)}${newName}${file.path.substring(end)}`;
    return this.fileService.move(from, to).pipe(tap(_ => {
      this.recurse(file, f => {
        f.path = f.path.substring(0, start) + newName + f.path.substring(end);
      });
    }));
  }

  move(container: Container, file: File, directory: File) {
    const [start] = file._namePos;
    const from = `${container.url}/dav/${file.path}`;
    const to = `${container.url}/dav/${directory.path}${file.path.substring(start)}`;
    return this.fileService.move(from, to).pipe(tap(_ => {
      this.recurse(file, f => {
        f.path = directory.path + f.path.substring(start);
      });
      this.setParent(file, directory);
    }));
  }

  delete(container: Container, file: File): Observable<void> {
    return this.fileService.delete(`${container.url}/dav/${file.path}`).pipe(tap(() => {
      this.removeFromParent(file);
      this.deletions.next(file);
    }));
  }

  private toFile(resource: DavResource): File {
    const file = new File();
    file.path = resource.href.substring('/dav'.length);
    file.modified = resource.modified;
    return file;
  }

  private recurse(file: File, callback: (file: File) => void) {
    callback(file);
    if (file.children) {
      for (const child of file.children) {
        this.recurse(child, callback);
      }
    }
  }

  private setParent(file: File, parent: File) {
    this.removeFromParent(file);

    file.parent = parent;
    if (parent.children) {
      this.insertSorted(parent.children, file);
    }
  }

  private insertSorted(parentChildren: File[], file: File) {
    const index = parentChildren.findIndex(f => File.compare(f, file) > 0);
    if (index >= 0) {
      parentChildren.splice(index, 0, file);
    } else {
      parentChildren.push(file);
    }
  }

  private removeFromParent(file: File) {
    const parentChildren = file.parent?.children;
    if (parentChildren) {
      const index = parentChildren.indexOf(file);
      parentChildren.splice(index, 1);
    }
    file.parent = undefined;
  }
}
