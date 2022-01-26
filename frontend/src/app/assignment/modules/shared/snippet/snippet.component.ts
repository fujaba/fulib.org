import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import {Snippet} from '../../../model/evaluation';

@Component({
  selector: 'app-snippet',
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.scss'],
})
export class SnippetComponent implements OnChanges {
  @ViewChild('code') code: ElementRef<HTMLElement>;

  @Input() snippet: Snippet;

  fileType?: string;
  contextLines = 0;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.snippet) {
      return;
    }

    const snippet = changes.snippet.currentValue;
    const lang = snippet.file.substring(snippet.file.lastIndexOf('.') + 1);
    this.fileType = lang;
    this.contextLines = snippet.context ? 2 : 0;

    if (lang && hljs.getLanguage(lang)) {
      setTimeout(() => {
        hljs.highlightElement(this.code.nativeElement);
      });
    }
  }
}
