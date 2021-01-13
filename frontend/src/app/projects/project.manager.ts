import {interval, Observable, Subscription} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Container} from './model/container';
import {File} from './model/file';
import {Project} from './model/project';

export class ProjectManager {
  private wss: WebSocketSubject<any>;
  private keepAliveTimer: Subscription;

  fileRoot: File;

  constructor(
    public readonly project: Project,
    container: Container,
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
        const path: string = message.path;
        const parentPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
        const parent = this.resolve(this.fileRoot, parentPath);
        if (parent && !this.resolve(parent, path)) {
          const child = new File();
          child.path = path;
          child.setParent(parent);
        }
        return;
      }
      case 'moved': {
        const to: string = message.to;
        const newParentPath = to.substring(0, to.lastIndexOf('/', to.length - 2) + 1);
        const newParent = this.resolve(this.fileRoot, newParentPath);
        const oldFile = this.resolve(this.fileRoot, message.from);

        if (oldFile) {
          if (newParent && newParent.children) {
            oldFile.path = message.to;
            oldFile.setParent(newParent);
          } else {
            oldFile.removeFromParent();
          }
        } else {
          if (newParent && newParent.children && !this.resolve(newParent, to)) {
            const newFile = new File();
            newFile.path = to;
            newFile.setParent(newParent);
          }
        }

        return;
      }
      case 'deleted': {
        const file = this.resolve(this.fileRoot, message.path);
        if (file) {
          file.removeFromParent();
        }
        return;
      }
    }
  }

  private resolve(file: File, path: string): File | undefined {
    if (file.path === path) {
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
