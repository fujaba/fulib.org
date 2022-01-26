import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import {Snippet} from '../../../model/evaluation';

@Component({
  selector: 'app-snippet',
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.scss'],
})
export class SnippetComponent implements OnInit, OnDestroy, OnChanges {
  static totalVisible = 0;

  @ViewChild('code') code: ElementRef<HTMLElement>;

  @Input() snippet: Snippet;

  fileType?: string;
  contextLines = 0;

  constructor() {
  }

  ngOnInit() {
    SnippetComponent.totalVisible++;
  }

  ngOnDestroy() {
    SnippetComponent.totalVisible--;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.snippet) {
      return;
    }

    const snippet = changes.snippet.currentValue;
    const lang = snippet.file.substring(snippet.file.lastIndexOf('.') + 1);
    this.fileType = lang;
    this.contextLines = snippet.context ? 2 : 0;

    if (lang && hljs.getLanguage(lang) && SnippetComponent.totalVisible < 100) {
      setTimeout(() => {
        hljs.highlightElement(this.code.nativeElement);
      });
    }
  }
}
