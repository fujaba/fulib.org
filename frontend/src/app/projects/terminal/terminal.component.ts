import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from 'ng-terminal';
import {Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements OnInit, OnDestroy {
  @ViewChild('term', {static: true}) terminal: NgTerminal;

  output$: Observable<string>;

  process?: string;

  constructor(
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.output$ = this.projectManager.exec(['/bin/bash']).pipe(
      tap(message => {
        if (message.process) {
          this.process = message.process;
        }
      }),
      filter(message => message.event === 'output'),
      map(message => message.text),
    );

    this.terminal.keyEventInput.subscribe(e => {
      if (e.key && this.process) {
        this.projectManager.input(e.key, this.process);
      }
    });
  }

  ngOnDestroy(): void {
  }
}
