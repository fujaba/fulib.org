import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, of} from 'rxjs';
import {flatMap, map, tap} from 'rxjs/operators';
import {FileService} from './file.service';
import {Container} from './model/container';
import {File} from './model/file';
import {FileEditor} from './model/file-editor';


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

  getContent(container: Container, file: File): Observable<string> {
    if (file.data?.content) {
      return of(file.data.content);
    }

    return this.fileService.download(container, file.path).pipe(tap(content => {
      if (!file.data) {
        file.data = {};
      }
      file.data.content = content;
    }));
  }

  saveContent(container: Container, file: File): Observable<void> {
    if (!file.data?.content) {
      return EMPTY;
    }
    return this.fileService.upload(container, file.path, file.data.content).pipe(tap(() => {
      if (file.data) {
        file.data.dirty = false;
      }
    }));
  }

  getChildren(container: Container, parent: File): Observable<File[]> {
    if (parent.data?.children) {
      return of(parent.data.children);
    }
    return this.fileService.getChildren(container, parent.path).pipe(tap(children => {
      children.sort(File.compare);

      for (const child of children) {
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

  createChild(container: Container, parent: File, name: string, directory: boolean): Observable<File> {
    const path = parent.path + name;
    return (directory ? this.fileService.createDirectory(container, path) : this.fileService.upload(container, path, '')).pipe(
      flatMap(() => this.fileService.get(container, path)),
      tap(file => this.setParent(file, parent)),
    );
  }

  rename(container: Container, file: File, newName: string): Observable<void> {
    const [start, end] = file._namePos;
    return this.fileService.move(container, file.path, file.path.substring(0, start) + newName + file.path.substring(end)).pipe(tap(_ => {
      this.recurse(file, f => {
        f.path = f.path.substring(0, start) + newName + f.path.substring(end);
      });
    }));
  }

  move(container: Container, file: File, directory: File) {
    const [start] = file._namePos;
    return this.fileService.move(container, file.path, directory.path + file.path.substring(start)).pipe(tap(_ => {
      this.recurse(file, f => {
        f.path = directory.path + f.path.substring(start);
      });
      this.setParent(file, directory);
    }));
  }

  delete(container: Container, file: File): Observable<void> {
    return this.fileService.delete(container, file.path).pipe(tap(() => {
      this.removeFromParent(file);
      this.deletions.next(file);
    }));
  }

  private recurse(file: File, callback: (file: File) => void) {
    callback(file);
    if (file?.data?.children) {
      for (const child of file.data.children) {
        this.recurse(child, callback);
      }
    }
  }

  private setParent(file: File, parent: File) {
    this.removeFromParent(file);

    if (!file.data) {
      file.data = {};
    }
    file.data.parent = parent;
    if (parent.data && parent.data.children) {
      this.insertSorted(parent.data.children, file);
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
    const data = file.data;
    if (!data) {
      return;
    }

    const parentChildren = data.parent?.data?.children;
    if (parentChildren) {
      const index = parentChildren.indexOf(file);
      parentChildren.splice(index, 1);
    }
    data.parent = undefined;
  }
}
