import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {FileHandler} from '../file-tree/file-handler.interface';
import {File} from '../model/file.interface';
import {Project} from '../model/project.interface';
import {ProjectsService} from '../projects.service';

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss']
})
export class ProjectWorkspaceComponent implements OnInit {
  project: Project;

  exampleRoot: File = {
    name: '.',
    children: [
      {name: 'build.gradle'},
      {name: 'settings.gradle'},
      {
        name: 'src',
        children: [
          {
            name: 'main',
            children: [
              {
                name: 'java',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };

  fileHandler: FileHandler = {
    open: (file: File) => this.open(file),
  };

  currentFile?: File;
  openFiles: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(switchMap(params => this.projectsService.get(params.id))).subscribe(project => {
      this.project = project;
      this.exampleRoot.name = project.name;
    });
  }

  open(file: File) {
    if (!this.openFiles.includes(file)) {
      this.openFiles.push(file);
    }
    this.currentFile = file;
  }

  close(file: File) {
    const index = this.openFiles.indexOf(file);
    if (index >= 0) {
      this.openFiles.splice(index, 1);
      this.currentFile = this.openFiles[index] || this.openFiles[index - 1];
    }
    if (file === this.currentFile) {
      this.currentFile = undefined;
    }
  }
}
