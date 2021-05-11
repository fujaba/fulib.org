import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Terminal} from '../model/terminal';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-terminal-tabs',
  templateUrl: './terminal-tabs.component.html',
  styleUrls: ['./terminal-tabs.component.scss'],
})
export class TerminalTabsComponent implements OnInit, OnDestroy {
  tabs: Terminal[] = [];
  current?: Terminal;

  nextId = 0;

  private subscription: Subscription;

  constructor(
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.addTab();

    this.subscription = this.projectManager.openRequests.subscribe(request => {
      if (request.type === 'terminal') {
        const terminal = {...request.terminal, id: this.generateId()};
        this.tabs.push(terminal);
        this.current = terminal;
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addTab() {
    const terminal = {
      id: this.generateId(),
      executable: '/bin/bash',
      workingDirectory: this.projectManager.fileRoot.path,
    };
    this.tabs.push(terminal);
    this.current = terminal;
  }

  private generateId(): string {
    return (this.nextId++).toString(36);
  }
}
