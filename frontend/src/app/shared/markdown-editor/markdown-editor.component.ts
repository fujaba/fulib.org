import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss'
})
export class MarkdownEditorComponent {
  @Input({required: true}) content: string;
  @Input() textareaId?: string;
  @Input() rows?: number;
  @Input() placeholder = '';

  @Output() contentChange = new EventEmitter<string>();
  /** "onchange" */
  @Output() change = new EventEmitter<string>();
  /** Ctrl-Enter */
  @Output() submit = new EventEmitter<string>();

  @ViewChild('textarea', {static: false}) textarea?: ElementRef<HTMLTextAreaElement>;

  preview = false;

  span(before: string, after: string) {
    if (!this.textarea) {
      return;
    }
    const textarea = this.textarea.nativeElement;

    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    const extendedSelection = textarea.value.substring(textarea.selectionStart - before.length, textarea.selectionEnd + after.length);
    if (selection.startsWith(before) && selection.endsWith(after)) {
      // Remove the before and after text from the selection
      textarea.setRangeText(selection.substring(before.length, selection.length - after.length), textarea.selectionStart, textarea.selectionEnd, 'select');
    } else if (extendedSelection.startsWith(before) && extendedSelection.endsWith(after)) {
      // Remove the before and after text from the extended selection
      textarea.setRangeText(extendedSelection.substring(before.length, extendedSelection.length - after.length), textarea.selectionStart - before.length, textarea.selectionEnd + after.length, 'select');
    } else {
      // Insert the before and after text around the selection
      textarea.setRangeText(before + selection + after, textarea.selectionStart, textarea.selectionEnd, 'select');
    }

    this.content = textarea.value;
    this.contentChange.emit(textarea.value);
    textarea.focus();
  }
}
