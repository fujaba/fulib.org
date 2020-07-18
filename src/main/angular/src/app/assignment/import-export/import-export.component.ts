import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnInit {

  importFile: File = null;

  @Output() import = new EventEmitter<File>();
  @Output() export = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit() {
  }

  onImport(): void {
    if (this.importFile) {
      this.import.emit(this.importFile);
    }
  }
}
