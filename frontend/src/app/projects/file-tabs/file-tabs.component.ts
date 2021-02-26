import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {Subscription} from 'rxjs';
import {map, mapTo, switchMap} from 'rxjs/operators';

import {FileService} from '../file.service';
import {File} from '../model/file';
import {FileEditor} from '../model/file-editor';
import {ProjectManager} from '../project.manager';
import {TabsComponent} from '../tabs/tabs.component';

@Component({
  selector: 'app-file-tabs',
  templateUrl: './file-tabs.component.html',
  styleUrls: ['./file-tabs.component.scss'],
})
export class FileTabsComponent implements OnInit, OnDestroy {
  @Input() active = false;

  @ViewChild('tabs') tabs: TabsComponent<FileEditor>;

  @Input('editors') openEditors: FileEditor[] = [];

  subscription = new Subscription();

  constructor(
    private fileService: FileService,
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.subscription.add(this.projectManager.openRequests.subscribe((editor: FileEditor) => {
      if (this.active) {
        this.open(editor);
      }
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

    this.tabs.open(editor);
  }

  newScratchFile() {
    const root = this.projectManager.fileRoot;
    this.fileService.getChildren(this.projectManager.container, root).pipe(
      map(children => {
        let i = 1;
        let name: string;
        let path: string;
        do {
          name = `scratch-${i++}.txt`;
          path = root.path + name;
        } while (children.find(child => child.path === path));
        return name;
      }),
      switchMap(name => this.fileService.createChild(this.projectManager.container, root, name, '').pipe(mapTo(name))),
    ).subscribe(name => {
      const file = this.fileService.resolve(root, root.path + name);
      if (file) {
        this.open({file, temporary: false});
      }
    });
  }

  openDrop(data: any) {
    let path: string;
    let temporary = false;
    let preview = false;

    if (typeof data === 'string') {
      path = data;
    } else if (typeof data.file === 'string') {
      path = data.file;
      temporary = !!data.temporary;
      preview = !!data.preview;
    } else {
      return;
    }

    const file = this.fileService.resolve(this.projectManager.fileRoot, path);
    if (file && !file.directory) {
      this.open({
        file,
        temporary,
        preview,
      });
    }
  }

  close(editor: FileEditor) {
    this.tabs.close(editor);
  }
}
