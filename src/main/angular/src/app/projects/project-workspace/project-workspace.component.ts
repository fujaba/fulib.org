import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {FileTabsComponent} from '../file-tabs/file-tabs.component';
import {FileHandler} from '../file-handler';
import {File} from '../model/file.interface';
import {Project} from '../model/project';
import {ProjectsService} from '../projects.service';

function setParents(file: File): File {
  if (file.children) {
    for (const child of file.children){
      child.parent = file;
      setParents(child);
    }
  }
  return file;
}

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss']
})
export class ProjectWorkspaceComponent implements OnInit {
  project: Project;

  exampleRoot: File = setParents({
    name: '.',
    info: 'project root',
    children: [
      {name: 'build.gradle', type: 'text/x-groovy'},
      {name: 'settings.gradle', type: 'text/x-groovy'},
      {name: '.gitignore', type: 'text/plain'},
      {name: 'README.md', type: 'text/x-markdown'},
      {
        name: 'docs',
        children: [
          {name: 'example.png', type: 'image/png'},
          {name: 'example.svg', type: 'image/svg+xml'},
        ],
      },
      {
        name: 'src',
        children: [
          {
            name: 'main',
            children: [
              {
                name: 'java',
                children: [
                  {name: 'Example.java', type: 'text/x-java'},
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  fileHandler: FileHandler = {
    open: (file: File) => this.fileTabs.open(file),
    rename: (file: File) => {},
    delete: (file: File) => this.fileTabs.close(file),
  };

  @ViewChild('fileTabs') fileTabs: FileTabsComponent;

  active: string = 'project';

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
  ) {
    Object.defineProperty(this.exampleRoot, 'name', {
      get: () => this.project?.name,
      set: (value) => {
        if (this.project) {
          this.project.name = value;
        }
      },
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(switchMap(params => this.projectsService.get(params.id))).subscribe(project => {
      this.project = project;
    });
  }
}
