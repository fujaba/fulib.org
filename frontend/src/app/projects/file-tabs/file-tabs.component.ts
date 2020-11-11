import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FileManager} from '../file.manager';
import {File} from '../model/file';

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
})
export class FileTabsComponent implements OnInit, OnDestroy {
  currentFile?: File;
  openFiles: File[] = [];

  subscription = new Subscription();

  constructor(
    private fileManager: FileManager,
  ) {
  }

  ngOnInit(): void {
    this.subscription.add(this.fileManager.openRequests.subscribe(file => this.open(file)));
    this.subscription.add(this.fileManager.deletions.subscribe(file => this.close(file)));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  open(file: File) {
    if (!this.openFiles.includes(file)) {
      this.openFiles.push(file);
    }
    this.currentFile = file;
    this.fileManager.getContent(file).subscribe(() => {
    });
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
