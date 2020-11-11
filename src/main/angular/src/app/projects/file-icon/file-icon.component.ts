import {Component, Input} from '@angular/core';
import {File} from '../model/file';

@Component({
  selector: 'app-file-icon',
  templateUrl: './file-icon.component.html',
  styleUrls: ['./file-icon.component.scss'],
})
export class FileIconComponent {
  @Input() file: File;
  @Input() open?: boolean;

  get icon(): string {
    if (this.file.name.endsWith('/')) {
      return this.open ? 'file-directory-open' : 'file-directory';
    }

    const dotIndex = this.file.name.lastIndexOf('.');
    if (dotIndex < 0) {
      return 'file';
    }

    const ext = this.file.name.substring(dotIndex);

    switch (ext) {
      case '.md':
        return 'markdown';
      case '.svg':
      case '.png':
        return 'image';
      case '.gradle':
        return 'gear';
      case '.java':
        return 'file-code';
      default:
        return 'file';
    }
  }
}
