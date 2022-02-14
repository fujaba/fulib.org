import {Component, Input} from '@angular/core';

import {GenerateResult} from '../model/GenerateResult';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-mockup-viewer',
  templateUrl: './mockup-viewer.component.html',
  styleUrls: ['./mockup-viewer.component.scss']
})
export class MockupViewerComponent {
  @Input() generateResult!: GenerateResult;
  @Input() index?: number;
  @Input() currentDisplay!: 'pages' | 'objects' | 'class';

  public currentIndex = 0;
  private maxIndex!: number;

  constructor() {
  }

  next() {
    if (!this.generateResult) {
      return;
    }

    if (this.currentIndex === this.maxIndex) {
      return;
    }

    this.currentIndex += 1;
  }

  previous() {
    if (!this.generateResult) {
      return;
    }

    if (this.currentIndex === 0) {
      return;
    }

    this.currentIndex -= 1;
  }

  setFirst() {
    this.currentIndex = 0;
  }

  setLast() {
    this.currentIndex = this.maxIndex;
  }

  get url(): string {
    if (!this.generateResult) {
      return '';
    }

    const fileUrl = this.getCurrentIFrameContent();
    return environment.workflowsUrl + '/workflows' + fileUrl;
  }

  private getCurrentIFrameContent(): string {
    if (!this.currentDisplay || !this.generateResult) {
      return '';
    }

    let result;
    switch (this.currentDisplay) {
      case 'pages':
        this.maxIndex = this.generateResult.numberOfPages - 1;

        if (this.maxIndex && this.currentIndex > this.maxIndex) {
          this.currentIndex = this.maxIndex;
        }

        result = this.getCurrentContent(this.generateResult.pages);
        break;
      case 'objects':
        this.maxIndex = this.generateResult.numberOfDiagrams - 1;

        if (this.maxIndex && this.currentIndex > this.maxIndex) {
          this.currentIndex = this.maxIndex;
        }

        result = this.getCurrentContent(this.generateResult.diagrams);
        break;
      case 'class':
        this.currentIndex = 0;
        result = this.generateResult.classDiagram;
        break;
    }

    return result;
  }

  private getCurrentContent(generateMap: Map<number, string>): string {
    if (!generateMap) {
      return '<h1>Nothing generated yet to display</h1>'
    }

    if (this.index) {
      this.currentIndex = this.index;
      this.index = undefined;
    }

    const currentContent = generateMap.get(this.currentIndex);

    if (!currentContent) {
      return '';
    }

    return currentContent;
  }
}
