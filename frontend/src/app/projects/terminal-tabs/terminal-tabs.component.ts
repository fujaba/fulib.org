import {Component, OnInit} from '@angular/core';
import {Terminal} from '../model/terminal';

@Component({
  selector: 'app-terminal-tabs',
  templateUrl: './terminal-tabs.component.html',
  styleUrls: ['./terminal-tabs.component.scss'],
})
export class TerminalTabsComponent implements OnInit {
  tabs: Terminal[] = [];

  nextId = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.addTab();
  }

  addTab() {
    const id = (this.nextId++).toString(36);
    this.tabs.push({
      id,
      executable: '/bin/bash',
    });
  }
}
