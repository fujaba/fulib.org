import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Container} from './model/container';
import {Project} from './model/project';

export class ProjectManager {
  private wss: WebSocketSubject<any>;

  constructor(
    public readonly project: Project,
    container: Container,
    ) {
    const url = container.url.startsWith('http') ? `ws${container.url.substring(4)}/ws` : `${container.url}/ws`;
    this.wss = webSocket<any>(url);
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
    this.wss.complete();
    this.wss.unsubscribe();
  }
}
