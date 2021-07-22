import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {Process, Terminal} from '../../model/terminal';
import {ProjectManager} from '../../services/project.manager';

@Injectable()
export class TerminalService {
  private readonly webSocket: WebSocketSubject<any>;

  constructor(
    private projectManager: ProjectManager,
    private http: HttpClient,
  ) {
    this.webSocket = projectManager.webSocket;
  }

  getProcesses(): Observable<Process[]> {
    return this.http.get<Process[]>(this.projectManager.container.url + '/processes');
  }

  fromProcess({cmd, environment, process, workingDirectory}: Process): Terminal {
    const [executable, ...args] = cmd;
    return {
      id: process,
      executable,
      arguments: args,
      workingDirectory,
      environment,
    };
  }

  exec(terminal: Terminal): Observable<any> {
    const process: Process = {
      process: terminal.id,
      cmd: [terminal.executable, ...(terminal.arguments || [])],
      environment: terminal.environment,
      workingDirectory: terminal.workingDirectory,
    };
    return this.webSocket.multiplex(() => ({
      command: 'exec',
      ...process,
    }), () => ({
      command: 'kill',
      process: terminal.id,
    }), msg => {
      switch (msg.event) {
        case 'started':
        case 'output':
        case 'exited':
          return msg.process === terminal.id;
        default:
          return false;
      }
    });
  }

  kill(process: string): void {
    this.webSocket.next({command: 'kill', process});
  }

  input(text: string, process: string): void {
    this.webSocket.next({command: 'input', text, process});
  }

  resize(process: string, columns: number, rows: number) {
    this.webSocket.next({command: 'resize', process, columns, rows});
  }
}
