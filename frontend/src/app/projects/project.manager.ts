import {EventEmitter} from '@angular/core';
import {BehaviorSubject, interval, Observable, Subscription} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {FileService} from './file.service';
import {Container} from './model/container';
import {File} from './model/file';
import {FileEditor} from './model/file-editor';
import {Project} from './model/project';

export class ProjectManager {
  private wss: WebSocketSubject<any>;
  private keepAliveTimer: Subscription;

  fileRoot: File;

  openRequests = new EventEmitter<FileEditor>();
  updates = new EventEmitter<File>();
  deletions = new EventEmitter<File>();

  currentFile = new BehaviorSubject<File | undefined>(undefined);

  constructor(
    public readonly project: Project,
    container: Container,
    private fileService: FileService,
  ) {
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

  private create(path: string): void {
    const parentPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
    const parent = this.fileService.resolve(this.fileRoot, parentPath);
    if (parent && parent.children && !this.fileService.resolve(parent, path)) {
      const child = new File();
      child.path = path;
      child.setParent(parent);
    }
  }

  private move(from: string, to: string): void {
    const newParentPath = to.substring(0, to.lastIndexOf('/', to.length - 2) + 1);
    const newParent = this.fileService.resolve(this.fileRoot, newParentPath);
    const oldFile = this.fileService.resolve(this.fileRoot, from);

    if (oldFile) {
      if (newParent && newParent.children) {
        oldFile.path = to;
        oldFile.setParent(newParent);
        this.updates.next(oldFile);
      } else {
        oldFile.removeFromParent();
        this.deletions.next(oldFile);
      }
    } else {
      if (newParent && newParent.children && !this.fileService.resolve(newParent, to)) {
        const newFile = new File();
        newFile.path = to;
        newFile.setParent(newParent);
      }
    }
  }

  private delete(path: string): void {
    const file = this.fileService.resolve(this.fileRoot, path);
    if (file) {
      file.removeFromParent();
      this.deletions.next(file);
    }
  }

  open(editor: FileEditor): void {
    this.openRequests.next(editor);
  }

  exec(cmd: string[]): Observable<any> {
    let process = '';
    return this.wss.multiplex(() => ({
      command: 'exec', cmd,
    }), () => undefined, msg => {
      if (msg.event === 'started') {
        process = msg.process;
        return true;
      } else {
        return msg.event === 'output' && msg.process === process;
      }
    });
  }

  input(text: string, process: string): void {
    this.wss.next({command: 'input', text, process});
  }

  destroy() {
    this.keepAliveTimer.unsubscribe();
    this.wss.complete();
    this.wss.unsubscribe();
  }

  resize(columns: number, rows: number) {
    this.wss.next({command: 'resize', columns, rows});
  }
}
