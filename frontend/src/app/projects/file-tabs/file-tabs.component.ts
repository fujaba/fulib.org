import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {FileTypeService} from '../file-type.service';
import {FileService} from '../file.service';
import {Container} from '../model/container';
import {File} from '../model/file';
import {FileEditor} from '../model/file-editor';
import {FileType} from '../model/file-type';
import {ProjectManager} from '../project.manager';
import {TabsComponent} from '../tabs/tabs.component';

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
})
export class FileTabsComponent implements OnInit, OnDestroy {
  @ViewChild('tabs') tabs: TabsComponent<FileEditor>;

  openEditors: FileEditor[] = [];

  subscription = new Subscription();

  constructor(
    private container: Container,
    private fileService: FileService,
    private projectManager: ProjectManager,
    private fileTypeService: FileTypeService,
  ) {
  }

  ngOnInit(): void {
    this.subscription.add(this.projectManager.openRequests.subscribe((editor: FileEditor) => {
      this.open(editor);
    }));
    this.subscription.add(this.projectManager.deletions.subscribe((file: File) => {
      const editor = this.openEditors.find(ed => ed.file === file);
      if (editor) {
        this.tabs.close(editor);
      }
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  open(editor: FileEditor) {
    this.fileService.getContent(this.container, editor.file).subscribe(() => {
    });

    const existing = this.openEditors.find(e => editor.file === e.file && !!editor.preview === !!e.preview);
    if (existing) {
      existing.temporary = existing.temporary && editor.temporary;
      this.tabs.open(existing);
      return;
    }

    if (editor.temporary) {
      const temporary = this.openEditors.find(e => e.temporary);
      if (temporary) {
        temporary.file = editor.file;
        temporary.preview = editor.preview;
        this.tabs.open(temporary);
        return;
      }
    }

    this.openEditors.push(editor);
    this.tabs.open(editor);
  }

  newScratchFile() {
    const root = this.projectManager.fileRoot;
    this.fileService.getChildren(this.container, root).subscribe(children => {
      let i = 1;
      let path: string;
      do {
        path = `${root.path}scratch-${i++}.txt`;
      } while (children.find(child => child.path === path));

      const file = new File();
      file.path = path;
      file.type = this.fileTypeService.default;
      file.content = '';
      file.dirty = true;
      file.setParent(root);

      this.open({file, temporary: false});
    });
  }

  openPath(data: string) {
    const file = this.fileService.resolve(this.projectManager.fileRoot, data);
    if (file && !file.directory) {
      this.open({file, temporary: false});
    }
  }
}
