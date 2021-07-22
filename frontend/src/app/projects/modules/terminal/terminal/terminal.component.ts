import {AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgTerminal} from 'ng-terminal';
import {Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {IDisposable, ILink} from 'xterm';
import {FileService} from '../../../services/file.service';
import {Terminal} from '../../../model/terminal';
import {ProjectManager} from '../../../services/project.manager';
import {TerminalService} from '../terminal.service';

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

  private resize?: IDisposable;
  private linkProvider?: IDisposable;

  constructor(
    private terminalService: TerminalService,
    private projectManager: ProjectManager,
    private fileService: FileService,
    private zone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.output$ = this.terminalService.exec(this.model).pipe(
      filter(message => {
        switch (message.event) {
          case 'terminal.output':
            return true;
          case 'terminal.exited':
            this.terminal.write(`\r\nProcess finished with exit code ${message.exitCode}.\r\n`);
            return false;
          default:
            return false;
        }
      }),
      map(message => message.text),
      tap(output => this.extractMarkers(output)),
    );
  }

  ngAfterViewInit(): void {
    this.terminal.keyEventInput.subscribe(e => {
      if (e.key) {
        this.terminalService.input(e.key, this.model.id);
      }
    });

    const xterm = this.terminal.underlying;
    this.linkProvider = xterm.registerLinkProvider({
      provideLinks: (bufferLineNumber: number, callback: (links: (ILink[] | undefined)) => void) => {
        const line = xterm.buffer.active.getLine(bufferLineNumber - 1)?.translateToString(true);
        if (!line) {
          callback(undefined);
          return;
        }
        const links = this.findLinks(line, bufferLineNumber);
        callback(links);
      },
    });
    this.doResize(xterm.cols, xterm.rows);
    this.resize = xterm.onResize(({cols, rows}) => this.doResize(cols, rows));
  }

  private doResize(cols: number, rows: number) {
    this.terminalService.resize(this.model.id, cols, rows);
  }

  private extractMarkers(output: string): void {
    const pattern = /^([^:\r\n\t]+):(\d+):(?:(\d+):)? (\w+): (.*)(?:\r?\n.*\r?\n( +)\^)?$/gm;
    //                ~~~~~~~~~~~~~ filename          ~~~~~ severity            ~~~~~~ indent followed by caret
    //                              ~~~~~ line number        ~~~~ message
    //                                       ~~~~~ opt. column number    ~~ source code line copied by javac
    for (let match = pattern.exec(output); match !== null; match = pattern.exec(output)) {
      const [, path, row, column, severity, message, indent] = match;
      const ln = +row - 1;
      const ch = column ? +column : indent.length;
      this.projectManager.markers.next({
        path: this.toAbsolute(path),
        severity,
        message,
        from: {line: ln, ch},
        to: {line: ln, ch: ch + 1},
      });
    }
  }

  private findLinks(line: string, y: number) {
    const pattern = /([^:]+)(?::(\d+)(?::(\d+))?)?/g;
    const links: ILink[] = [];
    for (let match = pattern.exec(line); match !== null; match = pattern.exec(line)) {
      const [text, path, row, column] = match;
      if (!path.startsWith('/') && !row) {
        continue;
      }
      links.push({
        text,
        range: {
          start: {x: match.index + 1, y},
          end: {x: match.index + text.length, y},
        },
        decorations: {
          pointerCursor: true,
          underline: true,
        },
        activate: () => this.zone.run(() => this.openEditor(path, row, column)),
      });
    }
    return links;
  }

  private toAbsolute(path: string): string {
    return path.startsWith('/') ? path : `${this.model.workingDirectory}${path}`;
  }

  private openEditor(path: string, row: string, column: string) {
    path = this.toAbsolute(path);
    this.fileService.resolveAsync(this.projectManager.container, this.projectManager.fileRoot, path).subscribe(file => {
      if (!file) {
        return;
      }

      this.projectManager.openEditor({
        file,
        temporary: true,
      });
    });
  }

  ngOnDestroy(): void {
    this.resize?.dispose();
    this.linkProvider?.dispose();
  }
}
