import {Injectable} from '@angular/core';
import {EMPTY, forkJoin, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
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
      parent.setChildren(children);
      return children;
    }));
  }

  createChild(container: Container, parent: File, name: string, directoryOrContent: true | string | globalThis.File): Observable<File> {
    const path = parent.path + name;
    const url = `${container.url}/dav/${path}`;
    return (directoryOrContent === true ? this.dav.mkcol(url) : this.dav.put(url, directoryOrContent)).pipe(
      switchMap(() => {
        const resolved = this.resolve(parent, path);
        if (resolved) {
          return of(resolved);
        }
        return this.get(container, path).pipe(
          map(child => {
            // It is possible that the file change handler already created the file during the GET request.
            // Thus, we need to resolve it again and discard the GET result if necessary.
            const resolved2 = this.resolve(parent, path);
            if (resolved2) {
              return resolved2;
            }
            child.setParent(parent);
            return child;
          }),
        );
      }),
    );
  }

  rename(container: Container, file: File, newName: string): Observable<void> {
    const [start, end] = file._namePos;
    const newPath = `${file.path.substring(0, start)}${newName}${file.path.substring(end)}`;
    const from = `${container.url}/dav/${file.path}`;
    const to = `/dav/${newPath}`;
    return this.dav.move(from, to).pipe(
      tap(() => file.path = newPath),
    );
  }

  move(container: Container, file: File, directory: File): Observable<void> {
    if (directory.path.startsWith(file.path)) {
      return EMPTY;
    }

    const [start] = file._namePos;
    const from = `${container.url}/dav/${file.path}`;
    const to = `/dav/${directory.path}${file.path.substring(start)}`;
    return this.dav.move(from, to).pipe(
      tap(() => file.setParent(directory)),
    );
  }

  delete(container: Container, file: File): Observable<void> {
    return this.dav.delete(`${container.url}/dav/${file.path}`).pipe(
      tap(() => file.removeFromParent()),
    );
  }

  resolve(file: File, path: string): File | undefined {
    if (file.path === path || file.path === path + '/') {
      return file;
    }
    if (!file.children || !path.startsWith(file.path)) {
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
