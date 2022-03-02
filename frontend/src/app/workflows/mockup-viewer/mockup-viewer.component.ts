import {Component, Input, OnChanges} from '@angular/core';

import {GenerateResult} from '../model/GenerateResult';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-mockup-viewer',
  templateUrl: './mockup-viewer.component.html',
  styleUrls: ['./mockup-viewer.component.scss']
})
export class MockupViewerComponent implements OnChanges {
  @Input() generateResult!: GenerateResult;
  @Input() index: number;
  @Input() currentDisplay!: 'pages' | 'objects' | 'class';

  public url!: string;

  private maxIndex!: number;

  constructor() {
  }

  ngOnChanges(): void {
    this.evaluateUrl();
  }

  next() {
    if (!this.generateResult) {
      return;
    }

    if (this.index === this.maxIndex) {
      return;
    }

    this.index += 1;
    this.evaluateUrl();
  }

  previous() {
    if (!this.generateResult) {
      return;
    }

    if (this.index === 0) {
      return;
    }

    this.index -= 1;
    this.evaluateUrl();
  }

  setFirst() {
    this.index = 0;
    this.evaluateUrl();
  }

  setLast() {
    this.index = this.maxIndex;
    this.evaluateUrl();
  }

  evaluateUrl(): void {
    if (!this.generateResult) {
      this.url = environment.workflowsUrl + '/notYetGenerated';
      return;
    }

    const elementCouldExist = this.checkForContent();

    if (!elementCouldExist) {
      return;
    }

    const fileUrl = this.getCurrentIFrameContent();

    this.url = environment.workflowsUrl + '/workflows' + fileUrl;
  }

  private getCurrentIFrameContent(): string {
    let result;
    switch (this.currentDisplay) {
      case 'pages':
        this.maxIndex = this.generateResult.numberOfPages - 1;

        if (this.maxIndex < 0) {
          this.maxIndex = 0;
        }

        if (this.maxIndex && (this.index > this.maxIndex)) {
          this.index = this.maxIndex;
        }

        result = this.getCurrentContent(this.generateResult.pages);
        break;
      case 'objects':
        this.maxIndex = this.generateResult.numberOfDiagrams - 1;

        if (this.maxIndex < 0) {
          this.maxIndex = 0;
        }

        if (this.maxIndex && (this.index > this.maxIndex)) {
          this.index = this.maxIndex;
        }

        result = this.getCurrentContent(this.generateResult.diagrams);
        break;
      case 'class':
        this.index = 0;
        result = this.generateResult.classDiagram;
        break;
    }

    return result;
  }

  private getCurrentContent(generateMap: Map<number, string>): string | null {
    if (!generateMap) {
      return null;
    }

    const currentContent = generateMap.get(this.index);

    if (!currentContent) {
      return null;
    }

    return currentContent;
  }

  private checkForContent(): boolean {
    if (this.generateResult.numberOfPages === 0 && this.currentDisplay === 'pages') {
      this.url = environment.workflowsUrl + '/pagesFallback';
      return false;
    } else if (this.generateResult.numberOfDiagrams === 0 && this.currentDisplay === 'objects') {
      this.url = environment.workflowsUrl + '/objectsFallback';
      return false;
    } else if (!this.generateResult.classDiagram && this.currentDisplay === 'class') {
      this.url = environment.workflowsUrl + '/classFallback';
      return false;
    }
    return true;
  }
}
