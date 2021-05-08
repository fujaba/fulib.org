import {Component, OnInit} from '@angular/core';
import {Terminal} from '../model/terminal';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-terminal-tabs',
  templateUrl: './terminal-tabs.component.html',
  styleUrls: ['./terminal-tabs.component.scss'],
})
export class TerminalTabsComponent implements OnInit {
  tabs: Terminal[] = [];

  nextId = 0;

  constructor(
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.addTab();
  }

  addTab() {
    const id = (this.nextId++).toString(36);
    this.tabs.push({
      id,
      executable: '/bin/bash',
      workingDirectory: this.projectManager.fileRoot.path,
    });
  }
}
