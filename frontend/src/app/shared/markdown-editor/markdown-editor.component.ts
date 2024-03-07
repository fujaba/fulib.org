import {Component, EventEmitter, Input, Output} from '@angular/core';

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

  preview = false;
}
