import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {NgTerminal} from 'ng-terminal';
import {BehaviorSubject, EMPTY, Observable} from 'rxjs';
import {fromPromise} from 'rxjs/internal-compatibility';
import {filter, map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {Project} from '../model/project';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements OnInit, OnDestroy {
  @ViewChild('term', {static: true}) terminal: NgTerminal;

  project$ = new BehaviorSubject<Project | undefined>(undefined);
  output$: Observable<string>;

  process?: string;

  wss: WebSocketSubject<any>;

  constructor(
    private keycloakService: KeycloakService,
  ) {
  }

  get project(): Project | undefined {
    return this.project$.getValue();
  }

  @Input()
  set project(project: Project | undefined) {
    this.project$.next(project);
  }

  ngOnInit(): void {
    this.output$ = this.project$.pipe(
      withLatestFrom(fromPromise(this.keycloakService.getToken())),
      switchMap(([project, token]) => {
        if (project) {
          this.wss = webSocket<any>(`ws://localhost:4567/ws/projects/${project.id}?token=${token}`);
          this.wss.next({exec: ['/bin/bash']});
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
      filter(message => message.output),
      map(message => message.output),
    );

    this.terminal.keyEventInput.subscribe(e => {
      const ev = e.domEvent;
      const input = this.getInput(ev);
      if (input) {
        this.wss.next({input, process: this.process});
      }
    });
  }

  getInput(ev: KeyboardEvent): string | undefined {
    switch (ev.code) {
      case 'Enter':
        return '\n';
      case 'Backspace':
        return '\b';
      case 'Tab':
        return '\t';
      case 'Delete':
        return '\x1b[3~';
      case 'ArrowUp':
        return '\x1b[A';
      case 'ArrowDown':
        return '\x1b[B';
      case 'ArrowRight':
        return '\x1b[C';
      case 'ArrowLeft':
        return '\x1b[D';
      default:
        if (ev.altKey || ev.metaKey || ev.key.length !== 1) {
          return undefined;
        }
        if (ev.ctrlKey) {
          const code = ev.key.charCodeAt(0) - (ev.shiftKey ? 65 /* A */ : 97 /* a */) + 1;
          return String.fromCharCode(code);
        }
        return ev.key;
    }
    return undefined;
  }

  ngOnDestroy(): void {
    this.project = undefined;
    this.project$.unsubscribe();
  }
}
