import {Injectable} from '@angular/core';
import {EMPTY, forkJoin, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {DavClient} from './dav-client';
import {FileTypeService} from './file-type.service';
import {Container} from './model/container';
import {DavResource} from './model/dav-resource';
import {File} from './model/file';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(
    private dav: DavClient,
    private fileTypeService: FileTypeService,
  ) {
  }

  getContent(container: Container, file: File): Observable<string> {
    return this.dav.get(`${container.url}/dav/${file.path}`);
  }

  saveContent(container: Container, file: File): Observable<void> {
    if (file.content === undefined) {
      return EMPTY;
    }
    return this.dav.put(`${container.url}/dav/${file.path}`, file.content);
  }

  get(container: Container, path: string): Observable<File> {
    return this.dav.propFind(`${container.url}/dav/${path}`).pipe(map(resource => this.toFile(resource)));
  }

  getChildren(container: Container, parent: File): Observable<File[]> {
    return this.dav.propFindChildren(`${container.url}/dav/${parent.path}`).pipe(map(childResources => {
      const children = childResources.map(resource => this.toFile(resource));

      if (parent.children) {
        this.mergeChildren(parent, children);
      } else {
        children.sort(File.compare);
        for (const child of children) {
          child.parent = parent;
        }
        parent.children = children;
      }

      return children;
    }));
  }

  private mergeChildren(parent: File, children: File[]) {
    if (!parent.children) {
      return;
    }

    const mergedChildren: File[] = [];
    const newPaths = new Map(children.map(child => [child.path, child]));
    const oldPaths = new Set(parent.children.map(child => child.path));

    for (const newChild of children) {
      if (!oldPaths.has(newChild.path)) {
        // file was created
        newChild.parent = parent;
        mergedChildren.push(newChild);
      }
    }

    for (const oldChild of parent.children) {
      const newChild = newPaths.get(oldChild.path);
      if (newChild) {
        // file was modified
        oldChild.modified = newChild.modified;
        mergedChildren.push(oldChild);
      } else {
        // file was deleted
        oldChild.parent = undefined;
      }
    }

    mergedChildren.sort(File.compare);
    parent.children = mergedChildren;
  }

  createChild(container: Container, parent: File, name: string, directoryOrContent: true | string | globalThis.File): Observable<void> {
    const path = parent.path + name;
    const url = `${container.url}/dav/${path}`;
    return (directoryOrContent === true ? this.dav.mkcol(url) : this.dav.put(url, directoryOrContent));
  }

  rename(container: Container, file: File, newName: string): Observable<void> {
    const [start, end] = file._namePos;
    const from = `${container.url}/dav/${file.path}`;
    const to = `/dav/${file.path.substring(0, start)}${newName}${file.path.substring(end)}`;
    return this.dav.move(from, to);
  }

  move(container: Container, file: File, directory: File): Observable<void> {
    if (directory.path.startsWith(file.path)) {
      return EMPTY;
    }

    const [start] = file._namePos;
    const from = `${container.url}/dav/${file.path}`;
    const to = `/dav/${directory.path}${file.path.substring(start)}`;
    return this.dav.move(from, to);
  }

  delete(container: Container, file: File): Observable<void> {
    return this.dav.delete(`${container.url}/dav/${file.path}`);
  }

  resolve(file: File, path: string): File | undefined {
    if (file.path === path || file.path === path + '/') {
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

  resolveAsync(container: Container, file: File, path: string): Observable<File | undefined> {
    if (file.path === path || file.path === path + '/') {
      return of(file);
    }
    if (!path.startsWith(file.path)) {
      return of(undefined);
    }
    return this.getChildren(container, file).pipe(
      switchMap(children => forkJoin(children.map(child => this.resolveAsync(container, child, path)))),
      map(resolved => resolved.find(r => r)),
    );
  }

  private toFile(resource: DavResource): File {
    const file = new File();
    file.path = resource.href.substring('/dav'.length);
    file.type = this.fileTypeService.getFileType(file);
    file.modified = resource.modified;
    return file;
  }
}
