import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {FileService} from './file.service';
import {File, FileStub} from './model/file';
import {FileEditor} from './model/file-editor';
import {Revision} from './model/revision';


@Injectable({
  providedIn: 'root',
})
export class FileManager {
  openRequests = new EventEmitter<FileEditor>();
  updates = new EventEmitter<File>();
  deletions = new EventEmitter<File>();

  currentFile = new BehaviorSubject<File | undefined>(undefined);

  constructor(
    private fileService: FileService,
  ) {
  }

  open(editor: FileEditor): void {
    this.openRequests.next(editor);
  }

  getContent(file: File): Observable<string> {
    if (file.data?.content) {
      return of(file.data.content);
    }
    const revision = file.revisions[file.revisions.length - 1];
    if (!revision) {
      return of('');
    }

    return this.fileService.download(file, revision).pipe(tap(content => {
      if (!file.data) {
        file.data = {};
      }
      file.data.content = content;
    }));
  }

  saveContent(file: File): Observable<Revision> {
    if (!file.data?.content) {
      return EMPTY;
    }
    return this.fileService.upload(file, file.data.content).pipe(tap(revision => {
      file.revisions.push(revision);
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
      if (parent.data && parent.data.children) {
        this.insertSorted(parent.data.children, file);
      }
    }));
  }

  private insertSorted(parentChildren: File[], file: File) {
    const index = parentChildren.findIndex(f => File.compare(f, file) > 0);
    if (index >= 0) {
      parentChildren.splice(index, 0, file);
    } else {
      parentChildren.push(file);
    }
  }

  update(file: File): Observable<File> {
    file.data?.parent?.data?.children?.sort(File.compare);
    return this.fileService.update(file).pipe(tap(() => this.updates.next(file)));
  }

  move(child: File, parent: File): Observable<void> {
    child.parentId = parent.id;
    return this.fileService.update(child).pipe(map(() => {
      if (child.data) {
        const oldParentChildren = child.data.parent?.data?.children;
        if (oldParentChildren) {
          const index = oldParentChildren.indexOf(child);
          oldParentChildren.splice(index, 1);
        }
        child.data.parent = parent;
      }
      if (parent.data && parent.data.children) {
        this.insertSorted(parent.data.children, child);
      }
    }));
  }

  delete(file: File): Observable<void> {
    return this.fileService.delete(file.projectId, file.id).pipe(tap(() => {
      const data = file.data;
      if (data) {
        const parentChildren = data.parent?.data?.children;
        if (parentChildren) {
          const index = parentChildren.indexOf(file);
          parentChildren.splice(index, 1);
        }
        data.parent = undefined;
      }
      this.deletions.next(file);
    }));
  }
}
