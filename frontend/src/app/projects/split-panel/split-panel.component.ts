import {Component} from '@angular/core';

@Component({
  selector: 'app-split-panel',
  templateUrl: './split-panel.component.html',
  styleUrls: ['./split-panel.component.scss'],
})
export class SplitPanelComponent {
  panels: number[] = [];
  nextId = 0;

  active = 0;

  constructor() {
    this.addTab();
  }

  addTab() {
    this.panels.push(this.nextId++);
  }

  closeTab(panel: number) {
    const index = this.panels.indexOf(panel);
    this.panels.splice(index, 1);
  }
}
