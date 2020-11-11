import {Component, Input, OnInit} from '@angular/core';
import {FileManager} from '../file.manager';
import {File} from '../model/file';

@Component({
  selector: 'app-file-code-editor',
  templateUrl: './file-code-editor.component.html',
  styleUrls: ['./file-code-editor.component.scss'],
})
export class FileCodeEditorComponent implements OnInit {
  @Input() file: File;

  constructor(
    private fileManager: FileManager,
  ) {
  }

  ngOnInit(): void {
  }

  save() {
    this.fileManager.saveContent(this.file).subscribe(() => {});
  }

  setContent(content: string) {
    const data = this.file.data;
    if (data) {
      data.content = content;
      data.dirty = true;
    }
  }
}
