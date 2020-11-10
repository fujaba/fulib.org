import {Component, Input, OnInit} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {FileHandler} from '../file-handler';
import {File} from '../model/file.interface';

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
  newName?: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  open() {
    if (this.root.children) {
      this.expanded = !this.expanded;
      return;
    }

    this.handler?.open(this.root);
  }

  startRenaming() {
    this.newName = this.root.name;
  }

  finishRenaming() {
    this.root.name = this.newName!;
    this.newName = undefined;
    this.handler.rename(this.root);
  }

  cancelRenaming() {
    this.newName = undefined;
  }

  delete() {
    const parent = this.root.parent;
    if (!parent) {
      return;
    }

    const children = parent.children;
    if (!children) {
      return;
    }

    const index = children.indexOf(this.root);
    if (index < 0) {
      return;
    }

    if (confirm(`Delete ${this.root.name}?`)) {
      children.splice(index, 1);
      this.root.parent = undefined;
      this.handler?.delete(this.root);
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
    this.addChild({
      name: 'untitled.txt',
    });
  }

  createDir() {
    this.addChild({
      name: 'untitled',
      children: [],
    });
  }

  private addChild(file: File) {
    file.parent = this.root;
    this.root.children?.push(file);
  }
}
