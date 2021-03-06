import {Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';

import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {Marker} from '../../model/codegen/marker';
import {AutothemeCodemirrorComponent} from '../autotheme-codemirror/autotheme-codemirror.component';

@Component({
  selector: 'app-scenario-codemirror',
  templateUrl: './scenario-codemirror.component.html',
  styleUrls: ['./scenario-codemirror.component.scss'],
})
export class ScenarioCodemirrorComponent implements OnInit, OnDestroy {
  @ViewChild('scenarioInput', {static: true}) scenarioInput: AutothemeCodemirrorComponent;

  @Input() autoSubmit = false;

  @Input() content: string;
  @Output() contentChange = new EventEmitter<string>();

  @Output() save = new EventEmitter<void>();

  private _markers: Marker[] = [];

  readonly options: any;

  constructor(
    private zone: NgZone,
  ) {
    const submitHandler = () => this.zone.run(() => this.submit());

    this.options = {
      mode: 'scenario',
      lineNumbers: true,
      lineWrapping: true,
      styleActiveLine: true,
      gutters: ['CodeMirror-lint-markers'],
      extraKeys: {
        'Ctrl-Enter': submitHandler,
        'Cmd-Enter': submitHandler,
        'Ctrl-S': submitHandler,
        'Cmd-S': submitHandler,
      },
      lint: {
        lintOnChange: false,
        getAnnotations: () => this._markers,
      },
    };
  }

  get markers(): Marker[] {
    return this._markers;
  }

  @Input()
  set markers(value: Marker[]) {
    this._markers = value;
    this.performLint();
  }

  get readOnly(): boolean {
    return this.options.readOnly;
  }

  @Input()
  set readOnly(value: boolean) {
    this.options.readOnly = value;
  }

  get autoRefresh(): boolean {
    return this.options.autoRefresh;
  }

  @Input()
  set autoRefresh(value: boolean) {
    this.options.autoRefresh = value;
  }

  ngOnInit(): void {
    this.scenarioInput.contentChange.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(() => {
      if (this.autoSubmit && !this.readOnly) {
        this.submit();
      }
    });
  }

  private performLint() {
    (this.scenarioInput?.ngxCodemirror?.codeMirror as any)?.performLint?.();
  }

  ngOnDestroy() {
    this.scenarioInput.contentChange.unsubscribe();
  }

  submit() {
    this.save.emit();
  }
}
