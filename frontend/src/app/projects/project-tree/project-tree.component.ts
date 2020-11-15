import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FileRevisionsComponent} from '../file-revisions/file-revisions.component';
import {FileTreeComponent} from '../file-tree/file-tree.component';
import {FileManager} from '../file.manager';

import {File} from '../model/file';
import {FILE_ROOT} from '../injection-tokens';
import {Project} from '../model/project';

@Component({
  selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss'],
})
export class ProjectTreeComponent implements OnInit {
  panels = [
    {id: 'projectFiles', name: 'Project Files', component: FileTreeComponent, grow: true},
    {id: 'revisions', name: 'Revisions', component: FileRevisionsComponent},
  ];

  panelState: Record<string, { expanded: boolean; }> = {};

  currentFile: Observable<File | undefined>;

  constructor(
    @Inject(FILE_ROOT) public fileRoot: File,
    public project: Project,
    private fileManager: FileManager,
  ) {
    for (const panel of this.panels) {
      this.panelState[panel.id] = {
        expanded: true,
      };
    }
  }

  ngOnInit(): void {
    this.currentFile = this.fileManager.currentFile;
  }
}
