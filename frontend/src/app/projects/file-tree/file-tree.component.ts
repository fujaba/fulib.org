import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {DndDropEvent} from 'ngx-drag-drop';
import {EMPTY, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {FileChangeService} from '../file-change.service';
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

  @HostBinding('attr.data-expanded') expanded = false;
  @Output() expandedChanged = new EventEmitter<boolean>();

  newName?: string;
  currentFile: Observable<File | undefined>;
  root: File;
  container: Container;

  constructor(
    private fileService: FileService,
    private projectManager: ProjectManager,
    private fileChangeService: FileChangeService,
  ) {
  }

  ngOnInit(): void {
    this.currentFile = this.projectManager.currentFile;
    this.root = this.projectManager.fileRoot;
    this.container = this.projectManager.container;
    if (!this.file) {
      this.file = this.root;
    }

    this.expandedChanged.pipe(
      switchMap(expanded => expanded ? this.fileChangeService.watch(this.projectManager, this.file) : EMPTY),
    ).subscribe();
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

    this.expanded = !this.expanded;
    this.expandedChanged.next(this.expanded);

    this.fileService.getChildren(this.container, this.file).subscribe();
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
    this.fileService.createChild(this.container, this.file, name, directory ? true : '').subscribe();
  }

  onDrop(event: DndDropEvent): void {
    const files = event.event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (file) {
          this.fileService.createChild(this.projectManager.container, this.file, file.name, file).subscribe();
        }
      }
    }
    const data = event.data;
    if (typeof data === 'string') {
      const file = this.fileService.resolve(this.projectManager.fileRoot, data);
      if (file) {
        this.fileService.move(this.container, file, this.file).subscribe();
      }
    }
  }
}
