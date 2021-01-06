import {Component, Injector, OnInit, Type, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {FileTabsComponent} from '../file-tabs/file-tabs.component';
import {FileService} from '../file.service';
import {FILE_ROOT} from '../injection-tokens';
import {Container} from '../model/container';
import {File} from '../model/file';
import {Project} from '../model/project';
import {ProjectTreeComponent} from '../project-tree/project-tree.component';
import {ProjectService} from '../project.service';
import {SettingsComponent} from '../settings/settings.component';

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
  container: Container;
  fileRoot: File;

  @ViewChild('fileTabs') fileTabs: FileTabsComponent;

  sidebarItems: Record<string, SidebarItem> = {};

  injector: Injector;

  active?: string = 'project';

  constructor(
    parentInjector: Injector,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private fileService: FileService,
  ) {
    this.injector = Injector.create({
      name: 'ProjectWorkspace',
      parent: parentInjector,
      providers: [
        {provide: FILE_ROOT, useFactory: () => this.fileRoot},
        {provide: Project, useFactory: () => this.project},
        {provide: Container, useFactory: () => this.container},
      ],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => forkJoin([
        this.projectService.get(params.id).pipe(tap(project => this.project = project)),
        this.projectService.getContainer(params.id).pipe(tap(container => this.container = container)),
      ])),
      switchMap(([project]) => this.fileService.get(project.id, project.rootFileId)),
      tap(rootFile => this.fileRoot = rootFile),
    ).subscribe(_ => {
      this.initSidebar();

      if (!this.fileRoot.data) {
        this.fileRoot.data = {};
      }
      this.fileRoot.data.info = 'project root';
      Object.defineProperty(this.fileRoot, 'name', {
        get: () => this.project.name,
        set: () => {
        },
      });
    });
  }

  private initSidebar() {
    this.sidebarItems = {
      project: {name: 'Project', icon: 'code-square', component: ProjectTreeComponent},
      settings: {name: 'Settings', icon: 'gear', component: SettingsComponent},
    };
  }
}
