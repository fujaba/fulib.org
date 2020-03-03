import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

import {ThemeService} from '../theme.service';

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

  constructor(
    private themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.updateEditorThemes();
    this.editorThemeHandler = () => this.updateEditorThemes();
    this.themeService.addChangeHandler(this.editorThemeHandler);
  }

  ngOnDestroy(): void {
    this.themeService.removeHandler(this.editorThemeHandler);
  }

  private updateEditorThemes(): void {
    this.options.theme = this.themeService.theme === 'dark' ? 'darcula' : 'idea';
  }

  setContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }
}
