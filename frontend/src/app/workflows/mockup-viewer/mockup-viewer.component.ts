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
    if (!this.generateResult) {
      return [];
    }

    switch (this.currentDisplay) {
      case 'pages':
        if (this.generateResult.pages) {
          this.maxIndex = this.generateResult.pages.length - 1;
          return this.generateResult.pages.map((page, index) => this.createTab(index, page));
        }
        return [];
      case 'objects':
        if (this.generateResult.diagrams) {
          this.maxIndex = this.generateResult.diagrams.length - 1;
          return this.generateResult.diagrams.map((page, index) => this.createTab(index, page));
        }
        return [];
      case 'class':
        if (this.generateResult.classDiagrams) {
          this.maxIndex = this.generateResult.classDiagrams.length - 1;
          return this.generateResult.classDiagrams.map((page, index) => this.createTab(index, page));
        }
        return [];
    }
  }

  private createTab(index: number, value: string): WorkflowTab {
    const url = environment.workflowsUrl + '/workflows/' + value;

    const lastSlash = value.lastIndexOf('/');
    const name = value.substring(lastSlash + 1);

    return {index, name, url};
  }
}
