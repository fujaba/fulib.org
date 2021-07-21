import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Terminal} from '../../../model/terminal';
import {ProjectManager} from '../../../services/project.manager';
import {TerminalService} from '../terminal.service';

@Component({
  selector: 'app-terminal-tabs',
  templateUrl: './terminal-tabs.component.html',
  styleUrls: ['./terminal-tabs.component.scss'],
  providers: [TerminalService],
})
export class TerminalTabsComponent implements OnInit, OnDestroy {
  tabs: Terminal[] = [];
  current?: Terminal;

  private subscription: Subscription;

  constructor(
    private projectManager: ProjectManager,
    private terminalService: TerminalService,
  ) {
  }

  ngOnInit(): void {
    this.terminalService.getProcesses().subscribe(processes => {
      if (processes.length === 0) {
        this.addTab();
        return;
      }

      this.tabs = processes.map(({cmd, environment, process, workingDirectory}) => {
        const [executable, ...args] = cmd;
        return {
          id: process,
          executable,
          arguments: args,
          workingDirectory,
          environment,
        };
      });
      this.current = this.tabs[0];
    });

    this.subscription = this.projectManager.openRequests.subscribe(request => {
      if (request.type !== 'terminal') {
        return;
      }

      const terminal = request.terminal;
      if (terminal.id) {
        const existing = this.tabs.find(t => t.id === terminal.id);
        if (existing) {
          this.current = existing;
        } else {
          this.openNew(terminal as Terminal);
        }
      } else {
        terminal.id = this.generateId();
        this.openNew(terminal as Terminal);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addTab() {
    this.openNew({
      id: this.generateId(),
      executable: '/bin/bash',
      workingDirectory: this.projectManager.fileRoot.path,
    });
  }

  private openNew(terminal: Terminal) {
    this.tabs.push(terminal);
    this.current = terminal;
  }

  private generateId(): string {
    return (29 + Math.random()).toString(36);
  }
}
