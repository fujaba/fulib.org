import {Component, OnInit} from '@angular/core';
import {Terminal} from '../model/terminal';

@Component({
  selector: 'app-terminal-tabs',
  templateUrl: './terminal-tabs.component.html',
  styleUrls: ['./terminal-tabs.component.scss'],
})
export class TerminalTabsComponent implements OnInit {
  tabs: Terminal[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.addTab();
  }

  addTab() {
    this.tabs.push({cmd: ['/bin/bash']});
  }
}
