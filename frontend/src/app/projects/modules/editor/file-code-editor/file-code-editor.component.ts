import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EditorChange, Position} from 'codemirror';
import {BehaviorSubject, EMPTY, Subject, Subscription} from 'rxjs';
import {buffer, debounceTime, delay, filter, map, share, startWith, switchMap, tap} from 'rxjs/operators';
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
  editorId = (14 + Math.random()).toString(36);
  content = '';

  @ViewChild('codeMirror') codeMirror: AutothemeCodemirrorComponent;

  file$ = new BehaviorSubject<File | undefined>(undefined);
  cursorEvents$ = new Subject<Position>();
  changeEvents$ = new Subject<EditorChange>();

  subscription = new Subscription();

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
    for (const sub of [
      this.subscribeToFileChanges(),
      this.subscribeToMarkers(),
      this.subscribeToChangeEvents(),
      this.subscribeToCursorEvents(),
      this.subscribeToRemoteEvents(),
    ]) {
      this.subscription.add(sub);
    }
  }

  private subscribeToFileChanges(): Subscription {
    return this.file$.pipe(
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
  }

  private onExternalChange(file: File, content: string) {
    if (this.content && file.dirty && !confirm(file.name + ' was changed externally. Reload and discard changes?')) {
      return;
    }

    file.dirty = false;
    this.content = content;
  }

  private subscribeToMarkers(): Subscription {
    return this.file$.pipe(
      tap(() => this.markers = []),
      switchMap(file => file ? this.projectManager.markers.pipe(filter(m => m.path === file.path)) : EMPTY),
      buffer(this.projectManager.markers.pipe(debounceTime(50))),
    ).subscribe(markers => {
      this.markers = [...this.markers, ...markers];
    });
  }

  private subscribeToChangeEvents(): Subscription {
    const changeEvents$ = this.changeEvents$.pipe(
      filter(e => e.origin !== 'setValue' && e.origin !== 'remote'),
      share(),
    );
    return changeEvents$.pipe(
      buffer(changeEvents$.pipe(debounceTime(200))),
      map(changes => {
        return {
          command: 'editor.change',
          path: this.file!.path,
          editorId: this.editorId,
          changes,
        };
      }),
    ).subscribe(this.projectManager.webSocket);
  }

  private subscribeToCursorEvents(): Subscription {
    return this.cursorEvents$.pipe(
      debounceTime(200),
      map(position => ({
        command: 'editor.cursor',
        path: this.file!.path,
        editorId: this.editorId,
        position,
      })),
    ).subscribe(this.projectManager.webSocket);
  }

  private subscribeToRemoteEvents(): Subscription {
    return this.file$.pipe(
      delay(100),
      switchMap(file => file ? this.projectManager.webSocket.multiplex(
        () => ({command: 'editor.open', editorId: this.editorId, path: file.path}),
        () => ({command: 'editor.close', editorId: this.editorId, path: file.path}),
        ({command, path, editorId}) => {
          if (path !== file.path || editorId === this.editorId) {
            return false;
          }
          switch (command) {
            case 'editor.change':
            case 'editor.cursor':
            case 'editor.close':
              return true;
            default:
              return false;
          }
        },
      ) : EMPTY),
    ).subscribe(({command, changes, editorId, position}) => {
      switch (command) {
        case 'editor.change':
          this.onRemoteChanges(changes);
          return;
        case 'editor.cursor':
          this.onRemoteCursorActivity(editorId, position);
          return;
        case 'editor.close':
          this.removeCursor(editorId);
          return;
      }
    });
  }

  private removeCursor(editorId: string) {
    this.markers = this.markers.filter(m => m.message !== editorId);
  }

  private onRemoteCursorActivity(editorId: string, position: Position) {
    this.removeCursor(editorId);

    const endPosition: Position = {...position, ch: position.ch + 1};
    this.markers.push({
      severity: 'cursor',
      message: editorId,
      from: position,
      to: endPosition,
    });
  }

  private onRemoteChanges(changes: EditorChange[]) {
    for (const change of changes) {
      this.codeMirror.signal({...change, origin: 'remote'});
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  save() {
    this.markers.filter(m => m.severity !== 'cursor');
    const file = this.file;
    if (!file) {
      return;
    }
    this.projectManager.clearMarkers(file.path);
    this.projectManager.webSocket.next({
      command: 'editor.save',
      editorId: this.editorId,
      path: file.path,
    });

    const project = this.projectManager.project;
    if (project.local) {
      this.localProjectService.saveFile(project.id, file.path, this.content);
    }
    this.fileService.saveContent(this.projectManager.container, file, this.content).subscribe(() => {
      file.dirty = false;
    });
  }

  setContent(content: string) {
    const file = this.file;
    if (!file) {
      return;
    }
    this.content = content;
    file.dirty = true;
  }
}
