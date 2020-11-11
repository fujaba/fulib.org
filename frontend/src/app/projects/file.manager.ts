import {EventEmitter, Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {FileService} from './file.service';
import {File, FileStub} from './model/file';


@Injectable({
  providedIn: 'root',
})
export class FileManager {
  openRequests = new EventEmitter<File>();
  updates = new EventEmitter<File>();
  deletions = new EventEmitter<File>();

  constructor(
    private fileService: FileService,
  ) {
  }

  open(file: File): void {
    this.openRequests.next(file);
  }

  getContent(file: File): Observable<string> {
    if (file.data?.content) {
      return of(file.data.content);
    }
    return this.fileService.download(file.projectId, file.id).pipe(tap(content => {
      if (!file.data) {
        file.data = {};
      }
      file.data.content = content;
    }));
  }

  saveContent(file: File): Observable<void> {
    if (!file.data?.content) {
      return EMPTY;
    }
    return this.fileService.upload(file.projectId, file.id, file.data.content).pipe(tap(() => {
      if (file.data) {
        file.data.dirty = false;
      }
    }));
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

  createChild(parent: File, name: string, directory: boolean): Observable<File> {
    const file: FileStub = {
      projectId: parent.projectId,
      parentId: parent.id,
      name,
      directory,
    };
    return this.fileService.create(file).pipe(tap(file => {
      if (!file.data) {
        file.data = {};
      }
      file.data.parent = parent;
      if (!parent.data) {
        parent.data = {};
      }
      const parentChildren = parent.data.children;
      if (!parentChildren) {
        parent.data.children = [file];
      } else {
        const index = parentChildren.findIndex(f => File.compare(f, file) > 0);
        if (index >= 0) {
          parentChildren.splice(index, 0, file);
        } else {
          parentChildren.push(file);
        }
      }
    }));
  }

  update(file: File): Observable<File> {
    return this.fileService.update(file).pipe(tap(() => this.updates.next(file)));
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
      this.deletions.next(file);
    }));
  }
}
