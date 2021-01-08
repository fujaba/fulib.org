import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FileTypeService} from '../file-type.service';
import {FileService} from '../file.service';
import {Container} from '../model/container';
import {File} from '../model/file';

@Component({
  selector: 'app-file-code-editor',
  templateUrl: './file-code-editor.component.html',
  styleUrls: ['./file-code-editor.component.scss'],
})
export class FileCodeEditorComponent implements OnInit, OnDestroy {
  private _file: File;

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
    private container: Container,
    private fileManager: FileService,
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
    this.subscription = this.fileManager.updates.pipe(filter(file => file === this.file)).subscribe(() => {
      this.updateFileType();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateFileType() {
    this.options.mode = this.fileTypeService.getFileType(this.file).mode;
  }

  save() {
    this.fileManager.saveContent(this.container, this.file).subscribe();
  }

  setContent(content: string) {
    const data = this.file.data;
    if (data) {
      data.content = content;
      data.dirty = true;
    }
  }
}
