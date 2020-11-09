import { Component, OnInit } from '@angular/core';
import {File} from '../model/file.interface';

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss']
})
export class FileTabsComponent implements OnInit {
  currentFile?: File;
  openFiles: File[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  open(file: File) {
    if (!this.openFiles.includes(file)) {
      this.openFiles.push(file);
    }
    this.currentFile = file;
  }

  close(file: File) {
    const index = this.openFiles.indexOf(file);
    if (index >= 0) {
      this.openFiles.splice(index, 1);
      this.currentFile = this.openFiles[index] || this.openFiles[index - 1];
    }
    if (file === this.currentFile) {
      this.currentFile = undefined;
    }
  }
}
