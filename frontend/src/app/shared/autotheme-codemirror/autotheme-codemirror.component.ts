import {Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, PlatformRef, ViewChild} from '@angular/core';
import {CodemirrorComponent} from '@ctrl/ngx-codemirror';
import type {Editor, EditorChange, EditorConfiguration, Position} from 'codemirror';
import type {Annotation} from 'codemirror/addon/lint/lint';
import {ThemeService} from 'ng-bootstrap-darkmode';
import {interval, of, Subscription} from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
import {Marker} from '../model/marker';

@Component({
  selector: 'app-autotheme-codemirror',
  templateUrl: './autotheme-codemirror.component.html',
  styleUrls: ['./autotheme-codemirror.component.scss'],
})
export class AutothemeCodemirrorComponent implements OnInit, OnDestroy {
  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();
  @Output() changes = new EventEmitter<EditorChange>();
  @Output() cursorActivity = new EventEmitter<Position>();

  @Input() options: EditorConfiguration | Record<string, any>;

  private _markers: Marker[] = [];

  @ViewChild('ngxCodemirror') ngxCodemirror?: CodemirrorComponent;

  private subscription: Subscription;

  isBrowser = !!globalThis.navigator;

  constructor(
    private themeService: ThemeService,
    private zone: NgZone,
  ) {
  }

  get markers(): Marker[] {
    return this._markers;
  }

  @Input()
  set markers(value: Marker[]) {
    this._markers = value;
    this.options.lint ??= {
      lintOnChange: false,
      getAnnotations: (): Annotation[] => this._markers,
    };
    (this.options.gutters ??= []).push('CodeMirror-lint-markers');
    this.performLint();
  }

  ngOnInit() {
    this.subscription = this.themeService.theme$.pipe(
      switchMap(theme => theme === 'auto' ? this.themeService.detectedTheme$ : of(theme)),
    ).subscribe(theme => this.updateEditorThemes(theme));

    interval(20).pipe(
      take(10),
      map(() => this.ngxCodemirror?.codeMirror),
      filter(x => !!x),
      take(1),
    ).subscribe(() => {
      this.refreshCodeMirror();
      if (this.markers) {
        this.performLint();
      }
      this.listenForChanges();
    });
  }

  private performLint() {
    this.zone.runOutsideAngular(() => {
      this.ngxCodemirror?.codeMirror?.performLint();
    });
  }

  private refreshCodeMirror() {
    this.zone.runOutsideAngular(() => {
      this.ngxCodemirror?.codeMirror?.refresh();
    });
  }

  private listenForChanges() {
    this.zone.runOutsideAngular(() => {
      this.ngxCodemirror?.codeMirror?.on('change', (editor, change) => {
        this.zone.run(() => this.changes.emit(change));
      });
    });
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

  signal(change: EditorChange) {
    this.zone.runOutsideAngular(() => {
      this.ngxCodemirror?.codeMirror?.replaceRange(change.text, change.from, change.to, change.origin);
    });
  }

  onCursorActivity(editor: Editor) {
    this.cursorActivity.next(editor.getCursor());
  }
}
