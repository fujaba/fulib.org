import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, interval, Subscription} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {FileChangeService} from './file-change.service';
import {Container} from './model/container';
import {File} from './model/file';
import {FileEditor} from './model/file-editor';
import {Project} from './model/project';

@Injectable()
export class ProjectManager {
  webSocket: WebSocketSubject<any>;
  private keepAliveTimer: Subscription;

  project: Project;
  container: Container;
  fileRoot: File;

  openRequests = new EventEmitter<FileEditor>();

  currentFile = new BehaviorSubject<File | undefined>(undefined);

  constructor(
  ) {
  }

  init(project: Project, container: Container) {
    this.project = project;
    this.container = container;

    const url = container.url.startsWith('http') ? `ws${container.url.substring(4)}/ws` : `${container.url}/ws`;
    this.webSocket = webSocket<any>(url);
    this.keepAliveTimer = interval(10000).subscribe(() => {
      this.webSocket.next({command: 'keepAlive'});
    });
  }

  open(editor: FileEditor): void {
    this.openRequests.next(editor);
  }

  destroy() {
    this.keepAliveTimer?.unsubscribe();
    this.webSocket?.complete();
    this.webSocket?.unsubscribe();
  }
}
