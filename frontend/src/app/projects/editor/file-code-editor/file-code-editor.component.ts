import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, EMPTY, Subscription} from 'rxjs';
import {startWith, switchMap, tap} from 'rxjs/operators';
import {FileChangeService} from '../../file-change.service';
import {FileService} from '../../file.service';
import {File} from '../../model/file';
import {ProjectManager} from '../../project.manager';

@Component({
  selector: 'app-file-code-editor',
  templateUrl: './file-code-editor.component.html',
  styleUrls: ['./file-code-editor.component.scss'],
})
export class FileCodeEditorComponent implements OnInit, OnDestroy {
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
    },
    autoRefresh: true,
  };

  constructor(
    private fileService: FileService,
    private projectManager: ProjectManager,
    private fileChangeService: FileChangeService,
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
    const file = this.file;
    if (!file) {
      return;
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
}
