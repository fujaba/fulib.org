import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from 'ng-terminal';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Terminal} from '../model/terminal';
import {TerminalService} from './terminal.service';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  providers: [TerminalService],
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() model: Terminal;

  @ViewChild('term', {static: true}) terminal: NgTerminal;

  output$: Observable<string>;

  private resize;

  constructor(
    private terminalService: TerminalService,
  ) {
  }

  ngOnInit(): void {
    this.output$ = this.terminalService.exec(this.model.id, this.model.cmd).pipe(
      filter(message => {
        switch (message.event) {
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
      if (e.key) {
        this.terminalService.input(e.key, this.model.id);
      }
    });

    const xterm = this.terminal.underlying;
    this.doResize(xterm.cols, xterm.rows);
    this.resize = xterm.onResize(({cols, rows}) => this.doResize(cols, rows));
  }

  private doResize(cols: number, rows: number) {
    this.terminalService.resize(this.model.id, cols, rows);
  }

  ngOnDestroy(): void {
    this.resize?.dispose();
  }
}
