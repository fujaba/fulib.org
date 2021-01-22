import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, interval, Observable, Subscription} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {FileTypeService} from './file-type.service';
import {FileService} from './file.service';
import {Container} from './model/container';
import {File} from './model/file';
import {FileEditor} from './model/file-editor';
import {Project} from './model/project';

@Injectable()
export class ProjectManager {
  private wss: WebSocketSubject<any>;
  private keepAliveTimer: Subscription;

  project: Project;
  container: Container;
  fileRoot: File;

  openRequests = new EventEmitter<FileEditor>();
  renames = new EventEmitter<File>();
  deletions = new EventEmitter<File>();
  changes = new EventEmitter<File>();

  currentFile = new BehaviorSubject<File | undefined>(undefined);

  constructor(
    private fileService: FileService,
    private fileTypeService: FileTypeService,
  ) {
  }

  init(project: Project, container: Container) {
    this.project = project;
    this.container = container;

    const url = container.url.startsWith('http') ? `ws${container.url.substring(4)}/ws` : `${container.url}/ws`;
    this.wss = webSocket<any>(url);
    this.wss.subscribe(event => this.handleMessage(event));
    this.keepAliveTimer = interval(20000).subscribe(() => {
      this.wss.next({command: 'keepAlive'});
    });
  }

  private handleMessage(message: any) {
    if (!this.fileRoot) {
      return;
    }

    switch (message.event) {
      case 'modified': {
        this.change(message.path);
        return;
      }
      case 'created': {
        this.create(message.path);
        return;
      }
      case 'moved': {
        this.move(message.from, message.to);
        return;
      }
      case 'deleted': {
        this.delete(message.path);
        return;
      }
    }
  }

  private change(path: string): void {
    const file = this.fileService.resolve(this.fileRoot, path);
    if (file) {
      this.changes.next(file);
    }
  }

  private parentPath(path: string) {
    return path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
  }

  private create(path: string): void {
    const parentPath = this.parentPath(path);
    const parent = this.fileService.resolve(this.fileRoot, parentPath);
    this.maybeCreate(parent, path);
  }

  private maybeCreate(parent: File | undefined, path: string) {
    if (!parent || !parent.children) {
      return;
    }

    const existing = this.fileService.resolve(parent, path);
    if (existing) {
      this.changes.next(existing);
      return;
    }

    const child = new File();
    child.path = path;
    child.type = this.fileTypeService.getFileType(child);
    child.setParent(parent);
  }

  private move(from: string, to: string): void {
    const newParentPath = this.parentPath(to);
    const newParent = this.fileService.resolve(this.fileRoot, newParentPath);
    const oldFile = this.fileService.resolve(this.fileRoot, from);

    if (oldFile) {
      if (newParent && newParent.children) {
        oldFile.path = to;
        // TODO child paths need to be updated too
        oldFile.type = this.fileTypeService.getFileType(oldFile);
        oldFile.setParent(newParent);
        this.renames.next(oldFile);
      } else {
        this.doDelete(oldFile);
      }
    } else {
      this.maybeCreate(newParent, to);
    }
  }

  private delete(path: string): void {
    const file = this.fileService.resolve(this.fileRoot, path);
    if (file) {
      this.doDelete(file);
    }
  }

  private doDelete(file: File) {
    file.removeFromParent();
    this.deletions.next(file);
  }

  open(editor: FileEditor): void {
    this.openRequests.next(editor);
  }

  exec(cmd: string[]): Observable<any> {
    let process = '';
    return this.wss.multiplex(() => ({
      command: 'exec',
      cmd,
    }), () => ({
      command: 'kill',
      process,
    }), msg => {
      switch (msg.event) {
        case 'started':
          if (process) {
            return false;
          }
          process = msg.process;
          return true;
        case 'output':
        case 'exited':
          return msg.process === process;
        default:
          return false;
      }
    });
  }

  input(text: string, process: string): void {
    this.wss.next({command: 'input', text, process});
  }

  destroy() {
    this.keepAliveTimer?.unsubscribe();
    this.wss?.complete();
    this.wss?.unsubscribe();
  }

  resize(process: string, columns: number, rows: number) {
    this.wss.next({command: 'resize', process, columns, rows});
  }
}
