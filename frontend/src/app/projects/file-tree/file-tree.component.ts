import {AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {DndDropEvent} from 'ngx-drag-drop';
import {Observable} from 'rxjs';
import {FileService} from '../file.service';
import {Container} from '../model/container';
import {File} from '../model/file';
import {ProjectManager} from '../project.manager';

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss'],
})
export class FileTreeComponent implements OnInit, AfterViewInit {
  @Input() file: File;
  @Input() level = 0;

  @ViewChildren('nameInput') nameInput: QueryList<ElementRef>;

  newName?: string;
  currentFile: Observable<File | undefined>;
  root: File;

  constructor(
    public container: Container,
    private fileService: FileService,
    private projectManager: ProjectManager,
  ) {
  }

  @HostBinding('attr.data-expanded')
  get expanded(): boolean {
    return this.file.children !== undefined;
  }

  ngOnInit(): void {
    this.currentFile = this.projectManager.currentFile;
    this.root = this.projectManager.fileRoot;
    if (!this.file) {
      this.file = this.root;
    }
  }

  ngAfterViewInit(): void {
    this.nameInput.changes.subscribe(() => {
      this.nameInput.first?.nativeElement.focus();
    });
  }

  open(temporary: boolean) {
    this.projectManager.currentFile.next(this.file);

    if (!this.file.directory) {
      this.projectManager.open({file: this.file, temporary});
      return;
    }

    if (this.file.children) {
      this.file.children = undefined;
    } else {
      this.fileService.getChildren(this.container, this.file).subscribe();
    }
  }

  openPreview() {
    this.projectManager.open({file: this.file, temporary: false, preview: true});
  }

  startRenaming() {
    this.newName = this.file.name;
  }

  finishRenaming() {
    if (!this.newName) {
      return;
    }

    this.fileService.rename(this.container, this.file, this.newName).subscribe(() => {
      this.newName = undefined;
    });
  }

  cancelRenaming() {
    this.newName = undefined;
  }

  delete() {
    if (confirm(`Delete ${this.file.name}?`)) {
      this.fileService.delete(this.container, this.file).subscribe();
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
    this.addChild('untitled/', true);
  }

  private addChild(name: string, directory: boolean) {
    this.fileService.createChild(this.container, this.file, name, directory).subscribe();
  }

  onDrop(event: DndDropEvent): void {
    const path: string = event.data;
    const file = this.fileService.resolve(this.projectManager.fileRoot, path);
    if (file) {
      this.fileService.move(this.container, file, this.file).subscribe();
    }
  }
}
