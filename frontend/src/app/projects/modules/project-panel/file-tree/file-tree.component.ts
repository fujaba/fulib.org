import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {DndDropEvent} from 'ngx-drag-drop';
import {BehaviorSubject, EMPTY, Observable, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {FileChangeService} from '../../../services/file-change.service';
import {FileService} from '../../../services/file.service';
import {LocalProjectService} from '../../../services/local-project.service';
import {Container} from '../../../model/container';
import {File} from '../../../model/file';
import {ProjectManager} from '../../../services/project.manager';

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrls: ['./file-tree.component.scss'],
})
export class FileTreeComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() file: File;
  @Input() level = 0;

  @ViewChildren('nameInput') nameInput: QueryList<ElementRef>;

  expanded$ = new BehaviorSubject<boolean>(false);

  newName?: string;
  currentFile: Observable<File | undefined>;
  root: File;
  container: Container;

  private subscription = new Subscription();

  constructor(
    private fileService: FileService,
    private projectManager: ProjectManager,
    private localProjectService: LocalProjectService,
    private fileChangeService: FileChangeService,
  ) {
  }

  @HostBinding('attr.data-expanded')
  get expanded(): boolean {
    return this.expanded$.value;
  }

  ngOnInit(): void {
    this.currentFile = this.projectManager.currentFile;
    this.root = this.projectManager.fileRoot;
    this.container = this.projectManager.container;
    if (!this.file) {
      this.file = this.root;
      this.expanded$.next(true);
    }

    this.subscription.add(this.expanded$.pipe(
      switchMap(expanded => expanded ? this.fileChangeService.watch(this.projectManager, this.file) : EMPTY),
    ).subscribe());

    this.subscription.add(this.expanded$.pipe(
      switchMap(expanded => expanded ? this.fileService.getChildren(this.container, this.file) : EMPTY),
    ).subscribe());
  }

  ngAfterViewInit(): void {
    this.subscription.add(this.nameInput.changes.subscribe(() => {
      this.nameInput.first?.nativeElement.focus();
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  open(temporary: boolean) {
    this.projectManager.currentFile.next(this.file);

    if (!this.file.directory) {
      this.projectManager.openEditor({file: this.file, temporary});
      return;
    }

    this.expanded$.next(!this.expanded);
  }

  openPreview() {
    this.projectManager.openEditor({file: this.file, temporary: false, preview: true});
  }

  toggleRenaming() {
    if (this.newName) {
      this.finishRenaming();
    } else {
      this.startRenaming();
    }
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
    if (!confirm(`Delete ${this.file.name}?`)) {
      return;
    }

    this.localProjectService.deleteFile(this.container.projectId, this.file.path);
    this.fileService.delete(this.container, this.file).subscribe();
  }

  openContextMenu(event: MouseEvent, dropdown: NgbDropdown) {
    if (event.shiftKey || dropdown.isOpen()) {
      return;
    }

    dropdown.open();
    event.preventDefault();
  }

  createFile() {
    const fileName = prompt('New File', 'untitled.txt');
    if (fileName) {
      this.addChild(fileName, false);
    }
  }

  createDir() {
    let dirName = prompt('New Directory', 'untitled');
    if (dirName) {
      if (!dirName.endsWith('/')) {
        dirName += '/';
      }
      this.addChild(dirName, true);
    }
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
      const file = this.projectManager.fileRoot.resolve(data);
      if (file) {
        this.fileService.move(this.container, file, this.file).subscribe();
      }
    }
  }
}
