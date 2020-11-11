import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {FileService} from './file.service';
import {File, FileStub} from './model/file';


@Injectable({
  providedIn: 'root',
})
export class FileManager {
  constructor(
    private fileService: FileService,
  ) {
  }

  getChildren(parent: File): Observable<File[]> {
    if (parent.data?.children) {
      return of(parent.data.children);
    }
    return this.fileService.getChildren(parent.projectId, parent.id).pipe(tap(children => {
      for (let child of children) {
        if (!child.data) {
          child.data = {};
        }
        child.data.parent = parent;
      }
      if (!parent.data) {
        parent.data = {};
      }
      parent.data.children = children;
    }));
  }

  createChild(parent: File, name: string): Observable<File> {
    const file: FileStub = {
      projectId: parent.projectId,
      parentId: parent.id,
      name,
    };
    return this.fileService.create(file).pipe(tap(file => {
      if (!file.data) {
        file.data = {};
      }
      file.data.parent = parent;
      if (!parent.data) {
        parent.data = {};
      }
      if (!parent.data.children) {
        parent.data.children = [];
      }
      parent.data.children.push(file);
    }));
  }

  update(file: File): Observable<File> {
    return this.fileService.update(file);
  }

  delete(file: File): Observable<void> {
    const data = file.data;
    if (!data) {
      return EMPTY;
    }

    const parent = data.parent;
    if (!parent) {
      return EMPTY;
    }

    const children = parent.data?.children;
    if (!children) {
      return EMPTY;
    }

    const index = children.indexOf(file);
    if (index < 0) {
      return EMPTY;
    }

    return this.fileService.delete(file.projectId, file.id).pipe(tap(() => {
      children.splice(index, 1);
      data.parent = undefined;
    }));
  }
}
