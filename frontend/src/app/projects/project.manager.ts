import {interval, Observable, Subscription} from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Container} from './model/container';
import {Project} from './model/project';

export class ProjectManager {
  private wss: WebSocketSubject<any>;
  private keepAliveTimer: Subscription;

  constructor(
    public readonly project: Project,
    container: Container,
    ) {
    const url = container.url.startsWith('http') ? `ws${container.url.substring(4)}/ws` : `${container.url}/ws`;
    this.wss = webSocket<any>(url);
    this.keepAliveTimer = interval(20000).subscribe(() => {
      this.wss.next({command: 'keepAlive'});
    });
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
}
