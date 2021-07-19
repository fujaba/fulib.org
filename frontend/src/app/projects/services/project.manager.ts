import {Injectable} from '@angular/core';
import {BehaviorSubject, interval, ReplaySubject, Subject, Subscription} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Marker} from '../../shared/model/marker';
import {Container} from '../model/container';
import {File} from '../model/file';
import {FileEditor} from '../model/file-editor';
import {OpenRequest} from '../model/open-request';
import {Project} from '../model/project';
import {Terminal, TerminalStub} from '../model/terminal';

@Injectable()
export class ProjectManager {
  webSocket: WebSocketSubject<any>;
  private keepAliveTimer: Subscription;

  project: Project;
  container: Container;
  fileRoot: File;

  openRequests = new Subject<OpenRequest>();

  currentFile = new BehaviorSubject<File | undefined>(undefined);

  markers = new ReplaySubject<Marker>(1000);

  init(project: Project, container: Container) {
    this.project = project;
    this.container = container;

    const url = container.url.startsWith('http') ? `ws${container.url.substring(4)}/ws` : `${container.url}/ws`;
    this.webSocket = webSocket<any>(url);
    this.keepAliveTimer = interval(10000).subscribe(() => {
      this.webSocket.next({command: 'keepAlive'});
    });
  }

  openEditor(editor: FileEditor): void {
    this.openRequests.next({
      type: 'file-editor',
      editor,
    });
  }

  openTerminal(terminal: TerminalStub): void {
    this.openRequests.next({
      type: 'terminal',
      terminal,
    });
  }

  destroy() {
    this.keepAliveTimer?.unsubscribe();
    this.webSocket?.complete();
    this.webSocket?.unsubscribe();
  }
}
