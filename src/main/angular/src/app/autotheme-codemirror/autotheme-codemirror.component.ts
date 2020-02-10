import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

declare const themeChangeHandlers: (() => void)[];

declare function getTheme(): string;

@Component({
  selector: 'app-autotheme-codemirror',
  templateUrl: './autotheme-codemirror.component.html',
  styleUrls: ['./autotheme-codemirror.component.scss']
})
export class AutothemeCodemirrorComponent implements OnInit, OnDestroy {
  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();

  @Input() options: any;

  editorThemeHandler: () => void;

  constructor() { }

  ngOnInit() {
    this.updateEditorThemes();
    this.editorThemeHandler = () => this.updateEditorThemes();
    themeChangeHandlers.push(this.editorThemeHandler);
  }

  ngOnDestroy(): void {
    const index = themeChangeHandlers.indexOf(this.editorThemeHandler);
    themeChangeHandlers.splice(index, 1);
  }

  private updateEditorThemes(): void {
    this.options.theme = getTheme() === 'dark' ? 'darcula' : 'idea';
  }

  setContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }
}
