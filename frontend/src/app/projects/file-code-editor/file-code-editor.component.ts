import {Component, Input, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FileTypeService} from '../file-type.service';
import {FileManager} from '../file.manager';
import {File} from '../model/file';

@Component({
  selector: 'app-file-code-editor',
  templateUrl: './file-code-editor.component.html',
  styleUrls: ['./file-code-editor.component.scss'],
})
export class FileCodeEditorComponent implements OnInit {
  @Input() file: File;

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
    private fileManager: FileManager,
    private fileTypeService: FileTypeService,
  ) {
  }

  ngOnInit(): void {
    this.updateFileType();
    this.subscription = this.fileManager.updates.pipe(filter(file => file === this.file)).subscribe(() => {
      this.updateFileType();
    });
  }

  private updateFileType() {
    this.options.mode = this.fileTypeService.getFileType(this.file).mode;
  }

  save() {
    this.fileManager.saveContent(this.file).subscribe(() => {
    });
  }

  setContent(content: string) {
    const data = this.file.data;
    if (data) {
      data.content = content;
      data.dirty = true;
    }
  }
}
