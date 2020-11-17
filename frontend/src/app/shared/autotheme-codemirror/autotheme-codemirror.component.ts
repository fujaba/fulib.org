import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CodemirrorComponent} from '@ctrl/ngx-codemirror';
import {ThemeService} from 'ng-bootstrap-darkmode';
import {of, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-autotheme-codemirror',
  templateUrl: './autotheme-codemirror.component.html',
  styleUrls: ['./autotheme-codemirror.component.scss'],
})
export class AutothemeCodemirrorComponent implements OnInit, OnDestroy {
  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();

  @Input() options: any;

  @ViewChild('ngxCodemirror') ngxCodemirror: CodemirrorComponent;

  private subscription: Subscription;

  constructor(
    private themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.subscription = this.themeService.theme$.pipe(
      switchMap(theme => theme === 'auto' ? this.themeService.detectedTheme$ : of(theme)),
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
