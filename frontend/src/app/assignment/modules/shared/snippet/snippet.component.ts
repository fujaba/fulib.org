import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import {Snippet} from '../../../model/evaluation';
import {ConfigService} from "../../../services/config.service";
import Solution from "../../../model/solution";
import {ReadAssignmentDto} from "../../../model/assignment";
import {IDE} from "../../../model/config";

@Component({
  selector: 'app-snippet',
  templateUrl: './snippet.component.html',
  styleUrls: ['./snippet.component.scss'],
  standalone: false,
})
export class SnippetComponent implements OnChanges {
  @ViewChild('code') code: ElementRef<HTMLElement>;

  @Input({required: true}) assignment?: ReadAssignmentDto;
  @Input({required: true}) solution?: Solution;
  @Input({required: true}) snippet: Snippet;
  @Input() expanded = true;
  @Input() wildcard?: string;
  @Output() updated = new EventEmitter<Snippet>();
  @Output() confirmed = new EventEmitter<Snippet>();

  fileType?: string;
  contextLines = 0;
  ide: IDE;

  constructor(
    configService: ConfigService,
  ) {
    this.ide = configService.get('ide');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.snippet) {
      const snippet = changes.snippet.currentValue;
      this.fileType = snippet.file.substring(snippet.file.lastIndexOf('.') + 1);
      this.contextLines = snippet.context ? 2 : 0;
    }
    if (changes.expanded) {
      this.setExpanded(changes.expanded.currentValue);
    }
  }

  setExpanded(expanded: boolean) {
    this.expanded = expanded;
    const lang = this.fileType;
    if (expanded && lang && hljs.getLanguage(lang)) {
      setTimeout(() => hljs.highlightElement(this.code.nativeElement));
    }
  }

  onSelectionChange() {
    if (!this.wildcard) {
      return;
    }

    const sel = document.getSelection();
    if (!sel?.rangeCount) {
      return;
    }

    const range = sel.getRangeAt(0);
    if (!this.code.nativeElement.contains(range.commonAncestorContainer)) {
      return;
    }

    const selectedText = range.extractContents();
    const textContent = selectedText.textContent;
    if (!textContent || textContent.includes(this.wildcard)) {
      return;
    }

    const mark = document.createElement('mark');
    mark.textContent = this.wildcard;
    range.insertNode(mark);
    sel.removeAllRanges();
    this.updateWildcardSnippet();

    mark.onauxclick = () => {
      mark.replaceWith(textContent);
      this.updateWildcardSnippet();
    };
  }

  updateWildcardSnippet() {
    this.snippet.pattern = this.code.nativeElement.textContent!;
    this.updated.next(this.snippet);
  }
}
