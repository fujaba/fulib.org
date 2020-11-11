import {Component, Input, OnInit} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {FileManager} from '../file.manager';
import {File} from '../model/file';

@Component({
  selector: 'app-file-tree',
  host: {
    '[attr.data-expanded]': 'expanded',
  },
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss'],
})
export class FileTreeComponent implements OnInit {
  @Input() root: File;
  @Input() level = 0;

  expanded = false;
  oldName?: string;

  constructor(
    private fileManager: FileManager,
  ) {
  }

  ngOnInit(): void {
  }

  open() {
    if (!this.root.directory) {
      this.fileManager.open(this.root);
      return;
    }

    this.expanded = !this.expanded;

    this.fileManager.getChildren(this.root).subscribe(() => {});
  }

  startRenaming() {
    this.oldName = this.root.name;
  }

  finishRenaming() {
    this.fileManager.update(this.root).subscribe(_ => {
      this.oldName = undefined;
    });
  }

  cancelRenaming() {
    this.root.name = this.oldName!;
    this.oldName = undefined;
  }

  delete() {
    if (confirm(`Delete ${this.root.name}?`)) {
      this.fileManager.delete(this.root).subscribe(() => {
      });
    }
  }

  openContextMenu(event: MouseEvent, dropdown: NgbDropdown) {
    if (event.shiftKey || dropdown.isOpen()) {
      return;
    }

    dropdown.open();
    event.preventDefault();
  }

  createFile() {
    this.addChild('untitled.txt', false);
  }

  createDir() {
    this.addChild('untitled', true);
  }

  private addChild(name: string, directory: boolean) {
    this.fileManager.createChild(this.root, name, directory).subscribe(() => {
    });
  }
}
