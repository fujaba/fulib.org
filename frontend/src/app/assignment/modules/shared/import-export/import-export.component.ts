import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss'],
  standalone: false,
})
export class ImportExportComponent {

  importFile?: File;

  @Output() import = new EventEmitter<File>();
  @Output() export = new EventEmitter<void>();

  onImport(): void {
    if (this.importFile) {
      this.import.emit(this.importFile);
    }
  }
}
