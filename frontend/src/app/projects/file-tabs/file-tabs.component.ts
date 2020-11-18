import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {Subscription} from 'rxjs';
import {FileManager} from '../file.manager';
import {File} from '../model/file';
import {FileEditor} from '../model/file-editor';

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
})
export class FileTabsComponent implements OnInit, OnDestroy {
  currentEditor?: FileEditor;
  openEditors: FileEditor[] = [];

  subscription = new Subscription();

  constructor(
    private fileManager: FileManager,
  ) {
  }

  ngOnInit(): void {
    this.subscription.add(this.fileManager.openRequests.subscribe((editor: FileEditor) => {
      this.open(editor);
    }));
    this.subscription.add(this.fileManager.deletions.subscribe((file: File) => {
      const editor = this.openEditors.find(ed => ed.file === file);
      if (editor) {
        this.close(editor);
      }
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  open(editor: FileEditor) {
    this.fileManager.getContent(editor.file).subscribe(() => {
    });

    const existing = this.openEditors.find(existing => editor.file === existing.file);
    if (existing) {
      existing.temporary = existing.temporary && editor.temporary;
      this.currentEditor = existing;
      return;
    }

    if (editor.temporary) {
      const temporary = this.openEditors.find(existing => existing.temporary);
      if (temporary) {
        temporary.file = editor.file;
        this.currentEditor = temporary;
        return;
      }
    }

    this.openEditors.push(editor);
    this.currentEditor = editor;
  }

  close(editor: FileEditor) {
    const index = this.openEditors.indexOf(editor);
    if (index >= 0) {
      this.openEditors.splice(index, 1);
      this.currentEditor = this.openEditors[index] || this.openEditors[index - 1];
    }
    if (editor === this.currentEditor) {
      this.currentEditor = undefined;
    }
  }

  closeOthers(editor: FileEditor) {
    this.currentEditor = editor;
    this.openEditors = [editor];
  }

  closeAll() {
    this.currentEditor = undefined;
    this.openEditors.length = 0;
  }

  closeLeftOf(editor: FileEditor) {
    const index = this.openEditors.indexOf(editor);
    this.openEditors.splice(0, index);
    this.replaceOpenFileIfNecessary(editor);
  }

  closeRightOf(editor: FileEditor) {
    const index = this.openEditors.indexOf(editor);
    this.openEditors.splice(index + 1);
    this.replaceOpenFileIfNecessary(editor);
  }

  private replaceOpenFileIfNecessary(editor: FileEditor) {
    if (this.currentEditor && !this.openEditors.includes(this.currentEditor)) {
      this.currentEditor = editor;
    }
  }

  auxClick(event: MouseEvent, editor: FileEditor) {
    if (event.button != 1) {
      return;
    }
    this.close(editor);
    event.preventDefault();
  }

  openContextMenu(event: MouseEvent, editor: FileEditor, dropdown: NgbDropdown) {
    if (event.button != 2 || event.shiftKey || dropdown.isOpen()) {
      return;
    }

    dropdown.open();
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
