import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from 'ng-terminal';
import {Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {Terminal} from '../model/terminal';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() model: Terminal;

  @ViewChild('term', {static: true}) terminal: NgTerminal;

  output$: Observable<string>;

  private resize;

  constructor(
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.output$ = this.projectManager.exec(this.model.cmd).pipe(
      tap(message => {
        if (message.process) {
          this.model.process = message.process;
        }
      }),
      filter(message => message.event === 'output'),
      map(message => message.text),
    );
  }

  ngAfterViewInit(): void {
    this.terminal.keyEventInput.subscribe(e => {
      if (e.key && this.model.process) {
        this.projectManager.input(e.key, this.model.process);
      }
    });

    const xterm = this.terminal.underlying;
    this.projectManager.resize(xterm.cols, xterm.rows);
    this.resize = xterm.onResize(({cols, rows}) => this.projectManager.resize(cols, rows));
  }

  ngOnDestroy(): void {
    this.resize?.dispose();
  }
}
