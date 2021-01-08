import {Component, Input, OnInit} from '@angular/core';
import {FileService} from '../file.service';
import {File} from '../model/file';

@Component({
  selector: 'app-file-revisions',
  templateUrl: './file-revisions.component.html',
  styleUrls: ['./file-revisions.component.scss'],
})
export class FileRevisionsComponent implements OnInit {
  @Input() file?: File;

  constructor(
    private fileManager: FileService,
  ) {
  }

  ngOnInit(): void {
    this.fileManager.currentFile.subscribe(file => this.file = file);
  }

}
