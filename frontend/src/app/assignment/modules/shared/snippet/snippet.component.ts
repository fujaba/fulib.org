import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import {Snippet} from '../../../model/evaluation';

@Component({
  selector: 'app-snippet',
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.scss'],
})
export class SnippetComponent implements OnInit {
  @ViewChild('code') code: ElementRef<HTMLElement>;

  @Input() snippet: Snippet;

  fileType?: string;
  contextLines = 0;

  constructor() {
  }

  ngOnInit(): void {
    const lang = this.snippet.file.substring(this.snippet.file.lastIndexOf('.') + 1);
    this.fileType = lang;
    if (this.snippet.context) {
      this.contextLines = 2;
    }

    if (lang && hljs.getLanguage(lang)) {
      setTimeout(() => {
        hljs.highlightElement(this.code.nativeElement);
      });
    }
  }
}
