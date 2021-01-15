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
      filter(message => {
        switch (message.event) {
          case 'started':
            this.model.process = message.process;
            return false;
          case 'output':
            return true;
          case 'exited':
            this.terminal.write(`\nProcess finished with exit code ${message.exitCode}.\r\n`);
            return false;
          default:
            return false;
        }
      }),
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
    this.doResize(xterm.cols, xterm.rows);
    this.resize = xterm.onResize(({cols, rows}) => this.doResize(cols, rows));
  }

  private doResize(cols: number, rows: number) {
    if (this.model.process) {
      this.projectManager.resize(this.model.process, cols, rows);
    }
  }

  ngOnDestroy(): void {
    this.resize?.dispose();
  }
}
