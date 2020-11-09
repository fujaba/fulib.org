import {Component, Input} from '@angular/core';
import {File} from '../model/file.interface';

@Component({
  selector: 'app-file-icon',
  templateUrl: './file-icon.component.html',
  styleUrls: ['./file-icon.component.scss'],
})
export class FileIconComponent {
  @Input() file: File;
  @Input() open?: boolean;

  get icon(): string {
    if (this.file.children) {
      return this.open ? 'file-directory-open' : 'file-directory';
    }

    switch (this.file.type) {
      case 'text/x-markdown':
        return 'markdown';
      case 'image/svg+xml':
      case 'image/png':
        return 'image';
      case 'text/x-groovy':
        return 'gear';
      case 'text/x-java':
        return 'file-code';
      default:
        return 'file';
    }
  }
}
