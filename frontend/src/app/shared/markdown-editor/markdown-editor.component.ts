import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MarkdownService} from "../../services/markdown.service";

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss',
  standalone: false,
})
export class MarkdownEditorComponent {
  @Input({required: true}) content: string;
  @Input() textareaId?: string;
  @Input() rows?: number;
  @Input() placeholder = '';

  @Output() contentChange = new EventEmitter<string>();
  /** "onchange" */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<string>();
  /** Ctrl-Enter */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() submit = new EventEmitter<string>();

  @ViewChild('textarea', {static: false}) textarea?: ElementRef<HTMLTextAreaElement>;

  preview = false;

  constructor(
    private markdownService: MarkdownService,
  ) {
  }

  paste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text/html');
    if (text && event.isTrusted) {
      event.preventDefault();
      const md = this.markdownService.parseMarkdown(text);
      document.execCommand('insertText', false, md);
    }
  }

  block(prefix: string) {
    if (!this.textarea) {
      return;
    }
    const textarea = this.textarea.nativeElement;
    const {start, end, selection} = this.blockSelection(textarea);
    const lines = selection.split('\n');
    const newText = lines.every(line => line.startsWith(prefix))
      ? lines.map(line => line.substring(prefix.length)).join('\n')
      : lines.map(line => prefix + line).join('\n');
    this.setText(textarea, newText, start, end);
  }

  private blockSelection(textarea: HTMLTextAreaElement) {
    const start = textarea.value.lastIndexOf('\n', textarea.selectionStart) + 1;
    const end = (textarea.value.indexOf('\n', textarea.selectionEnd) + 1) || textarea.value.length;
    const selection = textarea.value.substring(start, end);
    return {start, end, selection};
  }

  fence(prefix: string, suffix: string) {
    if (!this.textarea) {
      return;
    }
    const textarea = this.textarea.nativeElement;
    const {start, end, selection} = this.blockSelection(textarea);
    if (selection.startsWith(prefix) && selection.endsWith(suffix)) {
      // Remove the prefix and suffix from the selection
      this.setText(textarea, selection.substring(prefix.length, selection.length - suffix.length), start, end);
    } else {
      // Insert the prefix and suffix around the selection
      this.setText(textarea, prefix + selection + suffix, start, end);
    }
  }

  private setText(textarea: HTMLTextAreaElement, newText: string, start: number, end: number) {
    textarea.setRangeText(newText, start, end, 'select');
    this.content = textarea.value;
    this.contentChange.emit(textarea.value);
    textarea.focus();
  }

  span(before: string, after: string) {
    if (!this.textarea) {
      return;
    }
    const textarea = this.textarea.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    if (selection.startsWith(before) && selection.endsWith(after)) {
      // Remove the before and after text from the selection
      this.setText(textarea, selection.substring(before.length, selection.length - after.length), start, end);
    } else {
      // Insert the before and after text around the selection
      this.setText(textarea, before + selection + after, start, end);
    }
  }
}
