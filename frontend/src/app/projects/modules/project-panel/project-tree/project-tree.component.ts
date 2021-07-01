import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FileRevisionsComponent} from '../file-revisions/file-revisions.component';
import {FileTreeComponent} from '../file-tree/file-tree.component';

import {File} from '../../../model/file';
import {Project} from '../../../model/project';
import {ProjectManager} from '../../../services/project.manager';

@Component({
  selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss'],
})
export class ProjectTreeComponent implements OnInit {
  project: Project;

  panels = [
    {id: 'projectFiles', name: 'Project Files', component: FileTreeComponent, grow: true},
    {id: 'revisions', name: 'Revisions', component: FileRevisionsComponent},
  ];

  panelState: Record<string, { expanded: boolean; }> = {};

  currentFile: Observable<File | undefined>;

  constructor(
    private projectManager: ProjectManager,
  ) {
    for (const panel of this.panels) {
      this.panelState[panel.id] = {
        expanded: true,
      };
    }
  }

  ngOnInit(): void {
    this.project = this.projectManager.project;
    this.currentFile = this.projectManager.currentFile;
  }
}
