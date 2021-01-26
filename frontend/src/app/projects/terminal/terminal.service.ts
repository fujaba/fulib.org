import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {ProjectManager} from '../project.manager';

@Injectable()
export class TerminalService {
  private readonly webSocket: WebSocketSubject<any>;

  constructor(
    projectManager: ProjectManager,
  ) {
    this.webSocket = projectManager.webSocket;
  }

  exec(id: string, cmd: string[]): Observable<any> {
    return this.webSocket.multiplex(() => ({
      command: 'exec',
      process: id,
      cmd,
    }), () => ({
      command: 'kill',
      process: id,
    }), msg => {
      switch (msg.event) {
        case 'started':
        case 'output':
        case 'exited':
          return msg.process === id;
        default:
          return false;
      }
    });
  }

  input(text: string, process: string): void {
    this.webSocket.next({command: 'input', text, process});
  }

  resize(process: string, columns: number, rows: number) {
    this.webSocket.next({command: 'resize', process, columns, rows});
  }
}
