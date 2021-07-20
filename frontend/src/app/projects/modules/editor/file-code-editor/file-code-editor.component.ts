import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EditorChange} from 'codemirror';
import {BehaviorSubject, EMPTY, Subscription} from 'rxjs';
import {buffer, debounceTime, filter, startWith, switchMap, tap} from 'rxjs/operators';
import {AutothemeCodemirrorComponent} from '../../../../shared/autotheme-codemirror/autotheme-codemirror.component';
import {Marker} from '../../../../shared/model/marker';
import {File} from '../../../model/file';
import {FileChangeService} from '../../../services/file-change.service';
import {FileService} from '../../../services/file.service';
import {LocalProjectService} from '../../../services/local-project.service';
import {ProjectManager} from '../../../services/project.manager';

@Component({
  selector: 'app-file-code-editor',
  templateUrl: './file-code-editor.component.html',
  styleUrls: ['./file-code-editor.component.scss'],
})
export class FileCodeEditorComponent implements OnInit, OnDestroy {
  lastTimestamp: Date = new Date(0);

  @ViewChild('codeMirror') codeMirror: AutothemeCodemirrorComponent;

  file$ = new BehaviorSubject<File | undefined>(undefined);

  subscription: Subscription;

  options = {
    mode: '',
    lineNumbers: true,
    lineWrapping: true,
    styleActiveLine: true,
    extraKeys: {
      'Ctrl-S': this.save.bind(this),
      'Cmd-S': this.save.bind(this),
      'Ctrl-Space': 'autocomplete',
    },
    autoRefresh: true,
  };

  markers: Marker[] = [];

  constructor(
    private fileService: FileService,
    private projectManager: ProjectManager,
    private fileChangeService: FileChangeService,
    private localProjectService: LocalProjectService,
  ) {
  }

  get file(): File | undefined {
    return this.file$.value;
  }

  @Input()
  set file(file: File | undefined) {
    this.file$.next(file);
  }

  ngOnInit(): void {
    this.subscription = this.file$.pipe(
      switchMap(file => {
        if (!file) {
          return EMPTY;
        }
        const initialEvent = {
          file,
          event: 'modified' as const,
        };
        return this.fileChangeService.watch(this.projectManager, file).pipe(startWith(initialEvent));
      }),
      switchMap(event => {
        switch (event.event) {
          case 'modified':
            this.options.mode = event.file.type.mode;
            return this.fileService.getContent(this.projectManager.container, event.file).pipe(tap(content => {
              this.onExternalChange(event.file, content);
            }));
          case 'moved':
            this.options.mode = event.to.type.mode;
            return EMPTY;
          default:
            return EMPTY;
        }
      }),
    ).subscribe();

    const markerSub = this.file$.pipe(
      tap(() => this.markers = []),
      switchMap(file => file ? this.projectManager.markers.pipe(filter(m => m.path === file.path)) : EMPTY),
      buffer(this.projectManager.markers.pipe(debounceTime(50))),
    ).subscribe(markers => {
      this.markers = [...this.markers, ...markers];
    });
    this.subscription.add(markerSub);

    const changeSub = this.file$.pipe(
      switchMap(file => file ? this.projectManager.webSocket.multiplex(
        () => ({command: 'editor.open', path: file.path}),
        () => ({command: 'editor.close', path: file.path}),
        msg => msg.command === 'editor.change' && msg.path === file.path && new Date(msg.timestamp) > this.lastTimestamp,
      ) : EMPTY),
    ).subscribe(({change, timestamp}) => {
      this.lastTimestamp = new Date(timestamp);
      this.codeMirror.signal({...change, origin: 'remote'});
    });
    this.subscription.add(changeSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private onExternalChange(file: File, content: string) {
    const cached = file.content;
    if (cached !== undefined && cached !== content && !confirm(file.name + ' was changed externally. Reload and discard changes?')) {
      return;
    }

    file.dirty = false;
    file.content = content;
  }

  save() {
    this.markers = [];
    const file = this.file;
    if (!file) {
      return;
    }
    this.projectManager.clearMarkers(file.path);
    const project = this.projectManager.project;
    if (project.local) {
      this.localProjectService.saveFile(project.id, file.path, file.content ?? '');
    }
    this.fileService.saveContent(this.projectManager.container, file).subscribe(() => {
      file.dirty = false;
    });
  }

  setContent(content: string) {
    const file = this.file;
    if (!file) {
      return;
    }
    file.content = content;
    file.dirty = true;
  }

  onChange(change: EditorChange) {
    if (change.origin === 'setValue' || change.origin === 'remote') {
      return;
    }
    const timestamp = new Date();
    this.lastTimestamp = timestamp;
    this.projectManager.webSocket.next({
      command: 'editor.change',
      path: this.file!.path,
      timestamp,
      change,
    });
  }
}
