import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Process, Terminal} from '../../../model/terminal';
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
  processes: Process[] = [];
  current?: Terminal;

  private subscription = new Subscription();

  constructor(
    private projectManager: ProjectManager,
    private terminalService: TerminalService,
  ) {
  }

  ngOnInit(): void {
    this.terminalService.getProcesses().subscribe(processes => {
      this.processes = processes;
    });

    if (this.tabs.length === 0) {
      this.addTab();
    }

    this.subscription.add(this.subscribeToOpenRequests());
    this.subscription.add(this.subscribeToEvents());
  }

  private subscribeToOpenRequests(): Subscription {
    return this.projectManager.openRequests.subscribe(request => {
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

  private subscribeToEvents(): Subscription {
    return this.projectManager.webSocket.subscribe(message => {
      const {event, ...data} = message;
      switch (event) {
        case 'started':
          const process: Process = data;
          this.processes.push(process);
          return;
        case 'exited':
          const index = this.processes.findIndex(p => p.process === data.process);
          if (index >= 0) {
            this.processes.splice(index, 1);
          }
          return;
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

  reopen(process: Process) {
    const existing = this.tabs.find(t => t.id === process.process);
    if (existing) {
      this.current = existing;
      return;
    }

    const terminal = this.terminalService.fromProcess(process);
    this.openNew(terminal);
  }

  private openNew(terminal: Terminal) {
    this.tabs.push(terminal);
    this.current = terminal;
  }

  private generateId(): string {
    return (29 + Math.random()).toString(36);
  }
}
