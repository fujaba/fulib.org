import {Component, Injector, OnInit, Type, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {FileHandler} from '../file-handler';
import {FileTabsComponent} from '../file-tabs/file-tabs.component';
import {FILE_ROOT} from '../injection-tokens';
import {File} from '../model/file.interface';
import {Project} from '../model/project';
import {ProjectTreeComponent} from '../project-tree/project-tree.component';
import {ProjectService} from '../project.service';
import {SettingsComponent} from '../settings/settings.component';

function setParents(file: File): File {
  if (file.children) {
    for (const child of file.children) {
      child.parent = file;
      setParents(child);
    }
  }
  return file;
}

interface SidebarItem {
  component: Type<any>;
  name: string;
  icon: string
}

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss'],
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

  sidebarItems: Record<string, SidebarItem> = {};

  injector: Injector;

  active: string = 'project';

  constructor(
    parentInjector: Injector,
    private route: ActivatedRoute,
    private projectService: ProjectService,
  ) {
    Object.defineProperty(this.exampleRoot, 'name', {
      get: () => this.project?.name,
      set: (value) => {
        if (this.project) {
          this.project.name = value;
        }
      },
    });

    this.injector = Injector.create({
      name: 'ProjectWorkspace',
      parent: parentInjector,
      providers: [
        {provide: FILE_ROOT, useValue: this.exampleRoot},
        {provide: FileHandler, useValue: this.fileHandler},
        {provide: Project, useFactory: () => this.project},
      ],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(switchMap(params => this.projectService.get(params.id))).subscribe(project => {
      this.project = project;
      this.initSidebar();
    });
  }

  private initSidebar() {
    this.sidebarItems = {
      project: {name: 'Project', icon: 'file-code', component: ProjectTreeComponent},
      settings: {name: 'Settings', icon: 'gear', component: SettingsComponent},
    };
  }
}
