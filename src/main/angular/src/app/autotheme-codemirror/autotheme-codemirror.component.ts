import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

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

  constructor() {
  }

  ngOnInit() {
    this.updateEditorThemes();
    this.editorThemeHandler = () => this.updateEditorThemes();
    // TODO try-catch not needed once darkmode is an npm package
    try {
      themeChangeHandlers.push(this.editorThemeHandler);
    } catch {
    }
  }

  ngOnDestroy(): void {
    // TODO try-catch not needed once darkmode is an npm package
    try {
      const index = themeChangeHandlers.indexOf(this.editorThemeHandler);
      themeChangeHandlers.splice(index, 1);
    } catch {
    }
  }

  private updateEditorThemes(): void {
    // TODO try-catch not needed once darkmode is an npm package
    try {
      this.options.theme = getTheme() === 'dark' ? 'darcula' : 'idea';
    } catch {
    }
  }

  setContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }
}
