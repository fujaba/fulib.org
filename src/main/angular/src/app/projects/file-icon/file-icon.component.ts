import {Component, Input} from '@angular/core';
import {File} from '../model/file.interface';

@Component({
  selector: 'app-file-icon',
  templateUrl: './file-icon.component.html',
  styleUrls: ['./file-icon.component.scss'],
})
export class FileIconComponent {
  @Input() file: File;

  get icon(): string {
    if (this.file.children) {
      return 'file-directory';
    }

    switch (this.file.type) {
      case 'text/x-markdown':
        return 'markdown';
      default:
        return 'file-code';
    }
  }
}
