import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ThemeService} from 'ng-bootstrap-darkmode';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-autotheme-codemirror',
  templateUrl: './autotheme-codemirror.component.html',
  styleUrls: ['./autotheme-codemirror.component.scss'],
})
export class AutothemeCodemirrorComponent implements OnInit, OnDestroy {
  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();

  @Input() options: any;

  private subscription: Subscription;

  constructor(
    private themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.subscription = this.themeService.theme$.subscribe(theme => this.updateEditorThemes(theme));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateEditorThemes(theme: string | null): void {
    if (theme === 'auto') {
      theme = this.themeService.detectedTheme;
    }
    this.options.theme = theme === 'dark' ? 'darcula' : 'idea';
  }

  setContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }
}
