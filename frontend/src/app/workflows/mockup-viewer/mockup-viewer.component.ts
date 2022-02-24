import {Component, Input, OnChanges, OnInit} from '@angular/core';

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
      this.url = environment.workflowsUrl + '/fallback';
      return;
    }

    const fileUrl = this.getCurrentIFrameContent();

    if (!fileUrl) {
      this.url = environment.workflowsUrl + '/fallback';
      return;
    }

    this.url = environment.workflowsUrl + '/workflows' + fileUrl;
  }

  private getCurrentIFrameContent(): string | null {
    if (!this.currentDisplay || !this.generateResult) {
      return null;
    }

    let result;
    switch (this.currentDisplay) {
      case 'pages':
        this.maxIndex = this.generateResult.numberOfPages - 1;

        if (this.maxIndex && (this.index > this.maxIndex)) {
          this.index = this.maxIndex;
        }

        result = this.getCurrentContent(this.generateResult.pages);
        break;
      case 'objects':
        this.maxIndex = this.generateResult.numberOfDiagrams - 1;

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
}
