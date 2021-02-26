import {Component, Injector, OnDestroy, OnInit, Type} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {EditorService} from '../editor.service';
import {FileTypeService} from '../file-type.service';
import {FileService} from '../file.service';
import {Container} from '../model/container';
import {Project} from '../model/project';
import {ProjectTreeComponent} from '../project-tree/project-tree.component';
import {ProjectManager} from '../project.manager';
import {ProjectService} from '../project.service';
import {SettingsComponent} from '../settings/settings.component';
import {SplitPanelComponent} from '../split-panel/split-panel.component';
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
  providers: [
    ProjectManager,
    EditorService,
  ],
})
export class ProjectWorkspaceComponent implements OnInit, OnDestroy {
  project: Project;
  container: Container;

  sidebarItems: Record<string, SidebarItem> = {};

  active ? = 'project';

  terminalComponent?: typeof TerminalTabsComponent;
  fileTabsComponent?: typeof SplitPanelComponent;

  constructor(
    parentInjector: Injector,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private fileService: FileService,
    private fileTypeService: FileTypeService,
    private projectManager: ProjectManager,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => forkJoin([
        this.projectService.get(params.id).pipe(tap(project => this.project = project)),
        this.projectService.getContainer(params.id).pipe(tap(container => this.container = container)),
      ])),
      tap(([project, container]) => {
        this.projectManager.destroy();
        this.projectManager.init(project, container);

        this.sidebarItems.settings = {name: 'Settings', icon: 'gear', component: SettingsComponent};
        this.terminalComponent = TerminalTabsComponent;
      }),
      switchMap(([project, container]) => this.fileService.get(container, `/projects/${project.id}/`)),
      tap(fileRoot => {
        this.projectManager.fileRoot = fileRoot;
        this.fileTabsComponent = SplitPanelComponent;
        fileRoot.info = 'project root';
        Object.defineProperty(fileRoot, 'name', {
          get: () => this.project.name,
          set: () => {
          },
        });
      }),
    ).subscribe(_ => {
      this.sidebarItems.project = {name: 'Project', icon: 'code-square', component: ProjectTreeComponent};
    });
  }

  ngOnDestroy() {
    this.projectManager.destroy();
  }
}
