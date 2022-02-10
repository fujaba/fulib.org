import {Component, Input} from '@angular/core';
import {GenerateResult} from '../model/GenerateResult';

@Component({
  selector: 'app-mockup-viewer',
  templateUrl: './mockup-viewer.component.html',
  styleUrls: ['./mockup-viewer.component.scss']
})
export class MockupViewerComponent {
  @Input() generateResult!: GenerateResult;
  @Input() index?: number;
  @Input() currentDisplay!: 'pages' | 'objects' | 'class';

  public currentIndex = 1;
  private maxIndex!: number;

  constructor() {
  }

  getCurrentIFrameContent(): string {
    if (!this.currentDisplay || !this.generateResult) {
      return '';
    }

    let result;
    switch (this.currentDisplay) {
      case 'pages':
        this.maxIndex = this.generateResult.numberOfPages;

        if (this.maxIndex && this.currentIndex > this.maxIndex) {
          this.currentIndex = this.maxIndex;
        }

        result = this.getCurrentContent(this.generateResult.pages);
        break;
      case 'objects':
        this.maxIndex = this.generateResult.numberOfDiagrams;

        if (this.maxIndex && this.currentIndex > this.maxIndex) {
          this.currentIndex = this.maxIndex;
        }

        result = this.getCurrentContent(this.generateResult.diagrams);
        break;
      case 'class':
        this.currentIndex = 1;
        result = this.generateResult.classDiagram;
        break;
    }

    return result;
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

    if (this.currentIndex === 1) {
      return;
    }

    this.currentIndex -= 1;
  }

  setFirst() {
    this.currentIndex = 1;
  }

  setLast() {
    this.currentIndex = this.maxIndex;
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
