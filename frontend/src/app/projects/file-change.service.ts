import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {FileTypeService} from './file-type.service';
import {FileService} from './file.service';
import {File} from './model/file';
import {ProjectManager} from './project.manager';

@Injectable({providedIn: 'root'})
export class FileChangeService {
  constructor(
    private fileService: FileService,
    private fileTypeService: FileTypeService,
  ) {
  }

  start(projectManager: ProjectManager): Observable<void> {
    return projectManager.webSocket.pipe(map(event => this.handleMessage(projectManager, event)));
  }

  private handleMessage(projectManager: ProjectManager, message: any): void {
    if (!projectManager.fileRoot) {
      return;
    }

    switch (message.event) {
      case 'modified': {
        this.change(projectManager, message.path);
        return;
      }
      case 'created': {
        this.create(projectManager, message.path);
        return;
      }
      case 'moved': {
        this.move(projectManager, message.from, message.to);
        return;
      }
      case 'deleted': {
        this.delete(projectManager, message.path);
        return;
      }
    }
  }

  private change(projectManager: ProjectManager, path: string): void {
    const file = this.fileService.resolve(projectManager.fileRoot, path);
    if (file) {
      projectManager.changes.next(file);
    }
  }

  private parentPath(path: string) {
    return path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
  }

  private create(projectManager: ProjectManager, path: string): void {
    const parentPath = this.parentPath(path);
    const parent = this.fileService.resolve(projectManager.fileRoot, parentPath);
    this.maybeCreate(projectManager, parent, path);
  }

  private maybeCreate(projectManager: ProjectManager, parent: File | undefined, path: string) {
    if (!parent || !parent.children) {
      return;
    }

    const existing = this.fileService.resolve(parent, path);
    if (existing) {
      projectManager.changes.next(existing);
      return;
    }

    const child = new File();
    child.path = path;
    child.type = this.fileTypeService.getFileType(child);
    child.setParent(parent);
  }

  private move(projectManager: ProjectManager, from: string, to: string): void {
    const newParentPath = this.parentPath(to);
    const newParent = this.fileService.resolve(projectManager.fileRoot, newParentPath);
    const oldFile = this.fileService.resolve(projectManager.fileRoot, from);

    if (oldFile) {
      if (newParent && newParent.children) {
        oldFile.path = to;
        // TODO child paths need to be updated too
        oldFile.type = this.fileTypeService.getFileType(oldFile);
        oldFile.setParent(newParent);
        projectManager.renames.next(oldFile);
      } else {
        this.doDelete(projectManager, oldFile);
      }
    } else {
      this.maybeCreate(projectManager, newParent, to);
    }
  }

  private delete(projectManager: ProjectManager, path: string): void {
    const file = this.fileService.resolve(projectManager.fileRoot, path);
    if (file) {
      this.doDelete(projectManager, file);
    }
  }

  private doDelete(projectManager: ProjectManager, file: File) {
    file.removeFromParent();
    projectManager.deletions.next(file);
  }
}
