import {Component, Input, OnInit} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {filter} from 'rxjs/operators';
import {FileHandler} from '../file-handler';
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
  @Input() handler: FileHandler;

  expanded = false;
  oldName?: string;

  constructor(
    private fileManager: FileManager,
  ) {
  }

  ngOnInit(): void {
  }

  open() {
    if (!this.root.name.endsWith('/')) {
      this.handler?.open(this.root);
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
      this.handler.rename(this.root);
    });
  }

  cancelRenaming() {
    this.root.name = this.oldName!;
    this.oldName = undefined;
  }

  delete() {
    if (confirm(`Delete ${this.root.name}?`)) {
      this.fileManager.delete(this.root).subscribe(() => {
        this.handler?.delete(this.root);
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
    this.addChild('untitled.txt');
  }

  createDir() {
    this.addChild('untitled/');
  }

  private addChild(name: string) {
    this.fileManager.createChild(this.root, name).subscribe(() => {
    });
  }
}
