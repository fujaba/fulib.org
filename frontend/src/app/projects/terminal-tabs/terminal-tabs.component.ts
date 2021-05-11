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
        this.tabs.push({...request.terminal, id: this.generateId()});
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  addTab() {
    const id = this.generateId();
    this.tabs.push({
      id,
      executable: '/bin/bash',
      workingDirectory: this.projectManager.fileRoot.path,
    });
  }

  private generateId(): string {
    return (this.nextId++).toString(36);
  }
}
