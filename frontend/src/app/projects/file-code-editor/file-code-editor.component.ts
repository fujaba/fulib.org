import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, EMPTY, Subscription} from 'rxjs';
import {map, mapTo, startWith, switchMap} from 'rxjs/operators';
import {FileChangeService} from '../file-change.service';
import {FileService} from '../file.service';
import {File} from '../model/file';
import {ProjectManager} from '../project.manager';

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
      switchMap(file => file ? this.fileChangeService.watch(this.projectManager, file).pipe(mapTo(file), startWith(file)) : EMPTY),
      switchMap(file => this.fileService.getContent(this.projectManager.container, file).pipe(map(content => ({file, content})))),
    ).subscribe(({file, content}) => {
      this.options.mode = file.type.mode;
      this.onExternalChange(file, content);
    });
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
