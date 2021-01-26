import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {filter, startWith, switchMap} from 'rxjs/operators';
import {FileService} from '../file.service';
import {File} from '../model/file';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-file-code-editor',
  templateUrl: './file-code-editor.component.html',
  styleUrls: ['./file-code-editor.component.scss'],
})
export class FileCodeEditorComponent implements OnInit, OnDestroy {
  @Input() file: File;

  subscription: Subscription;

  options = {
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
  ) {
  }

  ngOnInit(): void {
    Object.defineProperty(this.options, 'mode', {
      get: () => this.file.type.mode,
      set: () => {
      },
      configurable: true,
      enumerable: true,
    });

    const sameFile = filter(file => file === this.file);
    this.subscription = this.projectManager.changes.pipe(
      sameFile,
      startWith(this.file),
      switchMap(() => this.fileService.getContent(this.projectManager.container, this.file)),
    ).subscribe(content => {
      this.onExternalChange(content);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private onExternalChange(content: string) {
    const cached = this.file.content;
    if (cached !== undefined && cached !== content && !confirm(this.file.name + ' was changed externally. Reload and discard changes?')) {
      return;
    }

    this.file.dirty = false;
    this.file.content = content;
  }

  save() {
    this.fileService.saveContent(this.projectManager.container, this.file).subscribe(() => {
      this.file.dirty = false;
    });
  }

  setContent(content: string) {
    this.file.content = content;
    this.file.dirty = true;
  }
}
