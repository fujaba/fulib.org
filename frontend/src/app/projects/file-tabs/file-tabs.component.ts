import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
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

  closeOthers(file: File) {
    this.currentFile = file;
    this.openFiles = [file];
  }

  closeAll() {
    this.currentFile = undefined;
    this.openFiles.length = 0;
  }

  closeLeftOf(file: File) {
    const index = this.openFiles.indexOf(file);
    this.openFiles.splice(0, index);
    this.replaceOpenFileIfNecessary(file);
  }

  closeRightOf(file: File) {
    const index = this.openFiles.indexOf(file);
    this.openFiles.splice(index + 1);
    this.replaceOpenFileIfNecessary(file);
  }

  private replaceOpenFileIfNecessary(file: File) {
    if (this.currentFile && !this.openFiles.includes(this.currentFile)) {
      this.currentFile = file;
    }
  }

  auxClick(event: MouseEvent, file: File) {
    if (event.button != 1) {
      return;
    }
    this.close(file);
    event.preventDefault();
  }

  openContextMenu(event: MouseEvent, file: File, dropdown: NgbDropdown) {
    if (event.button != 2 || event.shiftKey || dropdown.isOpen()) {
      return;
    }

    dropdown.open();
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
