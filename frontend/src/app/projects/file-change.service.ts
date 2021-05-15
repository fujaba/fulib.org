import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {FileTypeService} from './file-type.service';
import {File} from './model/file';
import {FileChanged, FileDeleted, FileModified} from './model/file-change';
import {ProjectManager} from './project.manager';

@Injectable({providedIn: 'root'})
export class FileChangeService {
  nextId = 0;

  constructor(
    private fileTypeService: FileTypeService,
  ) {
  }

  watch(projectManager: ProjectManager, file: File): Observable<FileChanged> {
    const path = file.path;
    const dirPath = file.directory ? path : file.parentPath;
    const id = (this.nextId++).toString(36);
    return projectManager.webSocket.multiplex(
      () => ({command: 'watch', id, path: dirPath}),
      () => ({command: 'unwatch', id}),
      message => {
        switch (message.event) {
          case 'modified':
          case 'created':
          case 'deleted':
            return message.path && message.path.startsWith(path);
          case 'moved':
            return (message.from && message.from.startsWith(path)) || (message.to && message.to.startsWith(path));
          default:
            return false;
        }
      },
    ).pipe(mergeMap(event => {
      const message = this.handleMessage(projectManager, event);
      return message ? of(message) : EMPTY;
    }));
  }

  private handleMessage(projectManager: ProjectManager, message: any): FileChanged | undefined {
    if (!projectManager.fileRoot) {
      return undefined;
    }

    switch (message.event) {
      case 'modified':
        return this.change(projectManager, message.path);
      case 'created':
        return this.create(projectManager, message.path);
      case 'moved':
        return this.move(projectManager, message.from, message.to);
      case 'deleted':
        return this.delete(projectManager, message.path);
    }
  }

  private change(projectManager: ProjectManager, path: string): FileModified | undefined {
    const file = projectManager.fileRoot.resolve(path);
    if (file) {
      return {
        event: 'modified',
        file,
      };
    }
  }

  private parentPath(path: string) {
    return path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
  }

  private create(projectManager: ProjectManager, path: string): FileChanged | undefined {
    const parentPath = this.parentPath(path);
    const parent = projectManager.fileRoot.resolve(parentPath);
    return this.maybeCreate(parent, path);
  }

  private maybeCreate(parent: File | undefined, path: string): FileChanged | undefined {
    if (!parent || !parent.children) {
      return;
    }

    const existing = parent.resolve(path);
    if (existing) {
      return {
        event: 'modified',
        file: existing,
      };
    }

    const child = new File();
    child.path = path;
    child.type = this.fileTypeService.getFileType(child);
    child.setParent(parent);
    return {
      event: 'created',
      file: child,
    };
  }

  private move(projectManager: ProjectManager, from: string | undefined, to: string): FileChanged | undefined {
    const newParentPath = this.parentPath(to);
    const newParent = projectManager.fileRoot.resolve(newParentPath);
    const oldFile = from ? projectManager.fileRoot.resolve(from) : undefined;

    if (oldFile) {
      if (newParent && newParent.children) {
        oldFile.path = to;
        // TODO child paths need to be updated too
        oldFile.type = this.fileTypeService.getFileType(oldFile);
        oldFile.setParent(newParent);
        return {
          event: 'moved',
          to: oldFile,
        };
      } else {
        return this.doDelete(oldFile);
      }
    } else {
      return this.maybeCreate(newParent, to);
    }
  }

  private delete(projectManager: ProjectManager, path: string): FileDeleted | undefined {
    const file = projectManager.fileRoot.resolve(path);
    return file ? this.doDelete(file) : undefined;
  }

  private doDelete(file: File): FileDeleted {
    file.removeFromParent();
    return {
      event: 'deleted',
      file,
    };
  }
}
