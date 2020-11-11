import {Component, Input, OnInit} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {FileHandler} from '../file-handler';
import {FileService} from '../file.service';
import {File, FileStub} from '../model/file';

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

  constructor(
    private fileService: FileService,
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

    if (this.root.data?.children) {
      return;
    }

    this.fileService.getChildren(this.root.projectId, this.root.id).subscribe(children => {
      if (!this.root.data) {
        this.root.data = {};
      }
      this.root.data.children = children;
    });
  }

  startRenaming() {
    this.newName = this.root.name;
  }

  finishRenaming() {
    this.root.name = this.newName!;
    this.fileService.update(this.root).subscribe(_ => {
      this.newName = undefined;
      this.handler.rename(this.root);
    });
  }

  cancelRenaming() {
    this.newName = undefined;
  }

  delete() {
    const data = this.root.data;
    if (!data) {
      return;
    }

    const parent = data.parent;
    if (!parent) {
      return;
    }

    const children = parent.data?.children;
    if (!children) {
      return;
    }

    const index = children.indexOf(this.root);
    if (index < 0) {
      return;
    }

    if (confirm(`Delete ${this.root.name}?`)) {
      children.splice(index, 1);
      data.parent = undefined;
      this.fileService.delete(this.root.projectId, this.root.id);
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
    this.addChild('untitled.txt');
  }

  createDir() {
    this.addChild('untitled/');
  }

  private addChild(name: string) {
    const file: FileStub = {
      projectId: this.root.projectId,
      parentId: this.root.id,
      name,
    }
    this.fileService.create(file).subscribe(file => {
      if (!file.data) {
        file.data = {};
      }
      file.data.parent = this.root;
      if (!this.root.data) {
        this.root.data = {};
      }
      if (!this.root.data.children) {
        this.root.data.children = [];
      }
      this.root.data.children.push(file);
    });
  }
}
