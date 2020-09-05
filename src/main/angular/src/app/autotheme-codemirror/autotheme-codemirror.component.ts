import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ThemeService} from 'ng-bootstrap-darkmode';
import {fromEvent, of, Subscription} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

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
    this.subscription = this.themeService.theme$.pipe(
      switchMap(theme => {
        return theme === 'auto' ? fromEvent<MediaQueryListEvent>(window.matchMedia('(prefers-color-scheme: dark)'), 'change').pipe(
          map(event => event.matches ? 'dark' : 'light'),
        ) : of(theme);
      }),
    ).subscribe(theme => this.updateEditorThemes(theme));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateEditorThemes(theme: string | null): void {
    this.options.theme = theme === 'dark' ? 'darcula' : 'idea';
  }

  setContent(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }
}
