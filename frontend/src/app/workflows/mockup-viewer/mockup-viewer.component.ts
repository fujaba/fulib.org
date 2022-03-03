import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import {WorkflowTab} from '../model/WorkflowTab';
import {GenerateResult} from '../model/GenerateResult';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-mockup-viewer',
  templateUrl: './mockup-viewer.component.html',
  styleUrls: ['./mockup-viewer.component.scss']
})
export class MockupViewerComponent implements OnChanges {
  @Input() generateResult?: GenerateResult;
  @Input() index: number;
  @Input() currentDisplay!: 'pages' | 'objects' | 'class';

  currentTabs!: WorkflowTab[];
  maxIndex!: number;

  ngOnChanges(changes: SimpleChanges): void {
    const indexChange = changes.index;

    if (indexChange) {
      this.evaluateTabs(indexChange.currentValue);
    } else {
      this.evaluateTabs();
    }
  }

  next(): void {
    if (!this.generateResult) {
      return;
    }

    if (this.index === this.maxIndex) {
      return;
    }

    this.index += 1;
  }

  previous(): void {
    if (!this.generateResult) {
      return;
    }

    if (this.index === 0) {
      return;
    }

    this.index -= 1;
  }

  setFirst(): void {
    this.index = 0;
  }

  setLast(): void {
    this.index = this.maxIndex;
  }

  evaluateTabs(index?: number): void {
    if (!this.generateResult) {
      return;
    }

    this.index = index ? index : 0;
    this.currentTabs = this.getCurrentTabs();
  }

  private getCurrentTabs(): WorkflowTab[] {
    let result: WorkflowTab[] = [];
    if (!this.generateResult) {
      return result;
    }

    switch (this.currentDisplay) {
      case 'pages':
        if (this.generateResult.pages) {
          result = Object.entries(this.generateResult.pages).map(([key, value]) => this.createTab(parseInt(key), value));
          this.maxIndex = result.length - 1;
        }
        break;
      case 'objects':
        if (this.generateResult.diagrams) {
          result = Object.entries(this.generateResult.diagrams).map(([key, value]) => this.createTab(parseInt(key), value));
          this.maxIndex = result.length - 1;
        }
        break;
      case 'class':
        if (this.generateResult.classDiagram) {
          const newTab = this.createTab(0, this.generateResult.classDiagram);
          result.push(newTab);
        }
        this.maxIndex = 0;
        break;
    }

    return result;
  }

  private createTab(index: number, value: string): WorkflowTab {
    const url = environment.workflowsUrl + '/workflows/' + value;

    const lastSlash = value.lastIndexOf('/');
    const name = value.substring(lastSlash + 1);

    return {index, name, url};
  }
}
