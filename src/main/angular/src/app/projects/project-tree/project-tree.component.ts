import {Component, Inject, OnInit} from '@angular/core';

import {FileHandler} from '../file-handler';
import {File} from '../model/file.interface';
import {FILE_ROOT} from '../injection-tokens';
import {Project} from '../model/project';

@Component({
  selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss'],
})
export class ProjectTreeComponent implements OnInit {
  constructor(
    @Inject(FILE_ROOT) public fileRoot: File,
    public fileHandler: FileHandler,
    public project: Project,
  ) {
  }

  ngOnInit(): void {
  }
}
