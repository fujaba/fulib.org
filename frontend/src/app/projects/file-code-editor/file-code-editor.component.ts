import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FileTypeService} from '../file-type.service';
import {FileService} from '../file.service';
import {Container} from '../model/container';
import {File} from '../model/file';
import {FileEditor} from '../model/file-editor';
import {FileType} from '../model/file-type';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-file-code-editor',
  templateUrl: './file-code-editor.component.html',
  styleUrls: ['./file-code-editor.component.scss'],
})
export class FileCodeEditorComponent implements OnInit, OnDestroy {
  @Input() editor: FileEditor;

  private _file: File;
  fileType: FileType;

  subscription: Subscription;

  options = {
    mode: 'null',
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
    public container: Container,
    private fileManager: FileService,
    private projectManager: ProjectManager,
    private fileTypeService: FileTypeService,
  ) {
  }

  get file(): File {
    return this._file;
  }

  @Input()
  set file(value: File) {
    this._file = value;
    this.updateFileType();
  }

  ngOnInit(): void {
    const sameFile = filter(file => file === this.file);
    this.subscription = new Subscription();
    this.subscription.add(this.projectManager.renames.pipe(sameFile).subscribe(() => this.updateFileType()));
    this.subscription.add(this.projectManager.changes.pipe(sameFile).subscribe(() => this.onExternalChange()));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateFileType() {
    this.fileType = this.fileTypeService.getFileType(this.file);
    this.options.mode = this.fileType.mode;
  }

  private onExternalChange() {
    if (this.file.dirty && !confirm(this.file.name + ' was changed externally. Reload and discard changes?')) {
      return;
    }

    this.file.dirty = false;
    this.file.content = undefined;
    this.fileManager.getContent(this.container, this.file).subscribe();
  }

  save() {
    this.fileManager.saveContent(this.container, this.file).subscribe();
  }

  setContent(content: string) {
    this.file.content = content;
    this.file.dirty = true;
  }
}
