import {Component, Input, OnInit} from '@angular/core';
import {File} from '../model/file.interface';
import {FileHandler} from './file-handler.interface';

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss'],
})
export class FileTreeComponent implements OnInit {
  @Input() root: File;
  @Input() level = 0;
  @Input() handler: FileHandler;

  expanded = false;

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
}
