import {Component, Input} from '@angular/core';
import {FileTypeService} from '../file-type.service';
import {File} from '../model/file';

@Component({
  selector: 'app-file-icon',
  templateUrl: './file-icon.component.html',
  styleUrls: ['./file-icon.component.scss'],
})
export class FileIconComponent {
  @Input() file: File;
  @Input() open?: boolean;

  constructor(
    private fileTypeService: FileTypeService,
  ) {
  }

  get icon(): string {
    if (this.file.directory) {
      return this.open ? 'folder2-open' : 'folder2';
    }

    return this.fileTypeService.getFileType(this.file).icon;
  }
}
