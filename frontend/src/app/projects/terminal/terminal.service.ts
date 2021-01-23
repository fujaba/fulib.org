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

  exec(cmd: string[]): Observable<any> {
    let process = '';
    return this.webSocket.multiplex(() => ({
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
    this.webSocket.next({command: 'input', text, process});
  }

  resize(process: string, columns: number, rows: number) {
    this.webSocket.next({command: 'resize', process, columns, rows});
  }
}
