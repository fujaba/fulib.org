import {Component, OnDestroy, OnInit, TemplateRef, Type, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {forkJoin} from 'rxjs';
import {map, mapTo, switchMap, tap} from 'rxjs/operators';
import {ContainerService} from '../container.service';

import {EditorService} from '../editor.service';
import {FileTypeService} from '../file-type.service';
import {FileService} from '../file.service';
import {LaunchPanelComponent} from '../launch/launch-panel/launch-panel.component';
import {LocalProjectService} from '../local-project.service';
import {Container} from '../model/container';
import {Project} from '../model/project';
import {ProjectTreeComponent} from '../project-tree/project-tree.component';
import {ProjectManager} from '../project.manager';
import {ProjectService} from '../project.service';
import {SettingsComponent} from '../settings/settings/settings.component';
import {SplitPanelComponent} from '../split-panel/split-panel.component';
import {TerminalTabsComponent} from '../terminal/terminal-tabs/terminal-tabs.component';

interface SidebarItem {
  id: string;
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
  @ViewChild('loadingModal', {static: true}) loadingModal: TemplateRef<any>;

  openModal: NgbModalRef;

  project: Project;
  container: Container;

  sidebarItems: SidebarItem[] = [
    {id: 'project', name: 'Project', icon: 'code-square', component: ProjectTreeComponent},
    {id: 'launch', name: 'Launch', icon: 'play', component: LaunchPanelComponent},
    {id: 'settings', name: 'Settings', icon: 'gear', component: SettingsComponent},
  ];

  terminalComponent?: typeof TerminalTabsComponent;
  fileTabsComponent?: typeof SplitPanelComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localProjectService: LocalProjectService,
    private projectService: ProjectService,
    private containerService: ContainerService,
    private fileService: FileService,
    private fileTypeService: FileTypeService,
    private projectManager: ProjectManager,
    private ngbModal: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      tap(() => {
        this.router.navigate([], {queryParams: {panel: undefined}, skipLocationChange: true});
        this.projectManager.destroy();
        this.openModal = this.ngbModal.open(this.loadingModal, {
          ariaLabelledBy: 'loading-modal-title',
          centered: true,
          backdrop: 'static',
          backdropClass: 'backdrop-blur',
          keyboard: false,
        });
      }),
      switchMap(({id}) => {
        const localProject = this.localProjectService.get(id);
        if (localProject) {
          this.project = localProject;
          return this.containerService.createLocal(localProject).pipe(map(container => {
            this.container = container;
            return [localProject, container] as const;
          }));
        } else {
          return forkJoin([
            this.projectService.get(id).pipe(tap(project => this.project = project)),
            this.containerService.create(id).pipe(tap(container => this.container = container)),
          ]);
        }
      }),
      tap(([project, container]) => {
        this.projectManager.init(project, container);
      }),
      switchMap(([project, container]) => this.projectService.restoreSetupAndFiles(container, project).pipe(mapTo([project, container] as const))),
      switchMap(([project, container]) => this.fileService.getWithChildren(container, `/projects/${project.id}/`)),
      tap(fileRoot => {
        this.projectManager.fileRoot = fileRoot;
        this.fileTabsComponent = SplitPanelComponent;
        this.terminalComponent = TerminalTabsComponent;
        fileRoot.info = 'project root';
        Object.defineProperty(fileRoot, 'name', {
          get: () => this.project.name,
          set: () => {
          },
        });
      }),
    ).subscribe(fileRoot => {
      this.openModal.close();
      if (fileRoot.children && fileRoot.children.length === 0) {
        this.router.navigate(['setup'], {relativeTo: this.route});
      }
    });
  }

  ngOnDestroy() {
    this.openModal?.close();
    this.projectManager.destroy();
  }

  exit() {
    if (this.project.local && !confirm(`'${this.project.name}' is a local project. `
      + 'Exiting will stop the current container and any changes will be discarded. '
      + 'Are you sure you want to exit?')) {
      return;
    }
    this.router.navigate(['/projects']);
    this.containerService.delete(this.project.id).subscribe();
  }
}
