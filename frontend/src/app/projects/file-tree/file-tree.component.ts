import {AfterViewInit, Component, ElementRef, Inject, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs';
import {FileManager} from '../file.manager';
import {FILE_ROOT} from '../injection-tokens';
import {File} from '../model/file';

@Component({
  selector: 'app-file-tree',
  host: {
    '[attr.data-expanded]': 'expanded',
  },
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss'],
})
export class FileTreeComponent implements OnInit, AfterViewInit {
  @Input() file: File;
  @Input() level = 0;

  @ViewChildren('nameInput') nameInput: QueryList<ElementRef>

  expanded = false;
  oldName?: string;
  currentFile: Observable<File | undefined>;

  constructor(
    private fileManager: FileManager,
    @Inject(FILE_ROOT) private root: File,
  ) {
  }

  ngOnInit(): void {
    this.currentFile = this.fileManager.currentFile;
    if (!this.file) {
      this.file = this.root;
    }
  }

  ngAfterViewInit(): void {
    this.nameInput.changes.subscribe(() => {
      this.nameInput.first?.nativeElement.focus();
    });
  }

  open() {
    this.fileManager.currentFile.next(this.file);

    if (!this.file.directory) {
      this.fileManager.open(this.file);
      return;
    }

    this.expanded = !this.expanded;

    this.fileManager.getChildren(this.file).subscribe(() => {});
  }

  startRenaming() {
    this.oldName = this.file.name;
  }

  finishRenaming() {
    this.fileManager.update(this.file).subscribe(_ => {
      this.oldName = undefined;
    });
  }

  cancelRenaming() {
    this.file.name = this.oldName!;
    this.oldName = undefined;
  }

  delete() {
    if (confirm(`Delete ${this.file.name}?`)) {
      this.fileManager.delete(this.file).subscribe(() => {
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
    this.fileManager.createChild(this.file, name, directory).subscribe(() => {
    });
  }
}
