import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from 'ng-terminal';
import {BehaviorSubject, EMPTY, Observable} from 'rxjs';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Container} from '../model/container';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements OnInit, OnDestroy {
  @ViewChild('term', {static: true}) terminal: NgTerminal;

  container$ = new BehaviorSubject<Container | undefined>(undefined);
  output$: Observable<string>;

  process?: string;

  wss: WebSocketSubject<any>;

  constructor(
  ) {
  }

  get container(): Container | undefined {
    return this.container$.getValue();
  }

  @Input()
  set container(container: Container | undefined) {
    this.container$.next(container);
  }

  ngOnInit(): void {
    this.output$ = this.container$.pipe(
      switchMap(container => {
        if (container) {
          const url = container.url.startsWith('http') ? `ws${container.url.substring(4)}/ws` : `${container.url}/ws`;
          this.wss = webSocket<any>(url);
          this.wss.next({command: 'exec', cmd: ['/bin/bash']});
          return this.wss.asObservable();
        } else {
          return EMPTY;
        }
      }),
      tap(message => {
        if (message.process) {
          this.process = message.process;
        }
      }),
      filter(message => message.event === 'output'),
      map(message => message.text),
    );

    this.terminal.keyEventInput.subscribe(e => {
      if (e.key) {
        this.wss.next({command: 'input', text: e.key, process: this.process});
      }
    });
  }

  ngOnDestroy(): void {
    this.container = undefined;
    this.container$.unsubscribe();
  }
}
