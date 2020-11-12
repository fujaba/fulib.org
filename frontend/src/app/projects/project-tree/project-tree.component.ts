import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
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
  currentFile: Observable<File | undefined>;

  constructor(
    @Inject(FILE_ROOT) public fileRoot: File,
    public project: Project,
    private fileManager: FileManager,
  ) {
  }

  ngOnInit(): void {
    this.currentFile = this.fileManager.currentFile;
  }
}
