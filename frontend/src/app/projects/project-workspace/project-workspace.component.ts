import {Component, Injector, OnInit, Type, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {FileTabsComponent} from '../file-tabs/file-tabs.component';
import {FileTypeService} from '../file-type.service';
import {FileService} from '../file.service';
import {FILE_ROOT} from '../injection-tokens';
import {Container} from '../model/container';
import {File} from '../model/file';
import {Project} from '../model/project';
import {ProjectTreeComponent} from '../project-tree/project-tree.component';
import {ProjectManager} from '../project.manager';
import {ProjectService} from '../project.service';
import {SettingsComponent} from '../settings/settings.component';
import {TerminalTabsComponent} from '../terminal-tabs/terminal-tabs.component';

interface SidebarItem {
  component: Type<any>;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss'],
})
export class ProjectWorkspaceComponent implements OnInit {
  project: Project;
  container: Container;
  projectManager: ProjectManager;
  fileRoot: File;

  sidebarItems: Record<string, SidebarItem> = {};

  injector: Injector;

  active ? = 'project';

  terminalComponent?: typeof TerminalTabsComponent;
  fileTabsComponent?: typeof FileTabsComponent;

  constructor(
    parentInjector: Injector,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private fileService: FileService,
    private fileTypeService: FileTypeService,
  ) {
    this.injector = Injector.create({
      name: 'ProjectWorkspace',
      parent: parentInjector,
      providers: [
        {provide: FILE_ROOT, useFactory: () => this.fileRoot},
        {provide: Project, useFactory: () => this.project},
        {provide: Container, useFactory: () => this.container},
        {provide: ProjectManager, useFactory: () => this.projectManager},
      ],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => forkJoin([
        this.projectService.get(params.id).pipe(tap(project => this.project = project)),
        this.projectService.getContainer(params.id).pipe(tap(container => this.container = container)),
      ])),
      tap(([project, container]) => {
        this.projectManager?.destroy();
        this.projectManager = new ProjectManager(project, container, this.fileService, this.fileTypeService);

        this.sidebarItems.settings = {name: 'Settings', icon: 'gear', component: SettingsComponent};
        this.terminalComponent = TerminalTabsComponent;
        this.fileTabsComponent = FileTabsComponent;
      }),
      switchMap(([project, container]) => this.fileService.get(container, `/projects/${project.id}/`)),
      tap(fileRoot => {
        this.projectManager.fileRoot = fileRoot;
        this.fileRoot = fileRoot;
      }),
    ).subscribe(_ => {
      this.sidebarItems.project = {name: 'Project', icon: 'code-square', component: ProjectTreeComponent};
      this.fileRoot.info = 'project root';
      Object.defineProperty(this.fileRoot, 'name', {
        get: () => this.project.name,
        set: () => {
        },
      });
    });
  }
}
