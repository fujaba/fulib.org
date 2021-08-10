import {Component, OnDestroy, OnInit, TemplateRef, Type, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {forkJoin, fromEvent, Subscription} from 'rxjs';
import {buffer, debounceTime, filter, map, mapTo, share, switchMap, tap} from 'rxjs/operators';

import {Project} from '../../model/project';
import {LaunchPanelComponent} from '../../modules/launch/launch-panel/launch-panel.component';
import {ProjectTreeComponent} from '../../modules/project-panel/project-tree/project-tree.component';
import {SettingsComponent} from '../../modules/settings/settings/settings.component';
import {ContainerService} from '../../services/container.service';
import {EditorService} from '../../services/editor.service';
import {FileService} from '../../services/file.service';
import {LocalProjectService} from '../../services/local-project.service';
import {MarkerStoreService} from '../../services/marker-store.service';
import {ProjectManager} from '../../services/project.manager';
import {ProjectService} from '../../services/project.service';

interface SidebarItem {
  id: string;
  component: Type<any>;
  name: string;
  icon: string;
}

const progressLabels = {
  metadata: 'Loading Project Metadata',
  container: 'Launching Container',
  connect: 'Connecting to Container',
  restoreFiles: 'Restoring Files',
  projectRoot: 'Loading Project Root',
};

const progressOrder: (keyof typeof progressLabels)[] = [
  'metadata',
  'container',
  'connect',
  'restoreFiles',
  'projectRoot',
];

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss'],
  providers: [
    ProjectManager,
    EditorService,
    MarkerStoreService,
  ],
})
export class ProjectWorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild('loadingModal', {static: true}) loadingModal: TemplateRef<any>;

  progressLabels = progressLabels;
  progressOrder = progressOrder;
  progress: Partial<Record<keyof typeof progressLabels, true>> = {};

  openModal: NgbModalRef;

  project: Project;

  sidebarItems: SidebarItem[] = [
    {id: 'project', name: 'Project', icon: 'code-square', component: ProjectTreeComponent},
    {id: 'launch', name: 'Launch', icon: 'play', component: LaunchPanelComponent},
    {id: 'settings', name: 'Settings', icon: 'gear', component: SettingsComponent},
  ];

  private subscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private localProjectService: LocalProjectService,
    private projectService: ProjectService,
    private containerService: ContainerService,
    private fileService: FileService,
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
        this.progress = {};
      }),
      switchMap(({id}) => {
        const localProject = this.localProjectService.get(id);
        if (localProject) {
          this.project = localProject;
          this.progress.metadata = true;
          return this.containerService.createLocal(localProject).pipe(map(container => {
            this.progress.container = true;
            return [localProject, container] as const;
          }));
        } else {
          return forkJoin([
            this.projectService.get(id).pipe(tap(project => {
              this.project = project;
              this.progress.metadata = true;
            })),
            this.containerService.create(id).pipe(tap(() => this.progress.container = true)),
          ]);
        }
      }),
      tap(([project, container]) => {
        this.projectManager.init(project, container);
        this.progress.connect = true;
      }),
      switchMap(([project, container]) => this.projectService.restoreSetupAndFiles(container, project).pipe(
        tap(() => this.progress.restoreFiles = true),
        mapTo([project, container] as const),
      )),
      switchMap(([project, container]) => this.fileService.getWithChildren(container, `/projects/${project.id}/`)),
      tap(fileRoot => {
        this.progress.projectRoot = true;
        this.projectManager.fileRoot = fileRoot;
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

    const doubleShiftDelay = 300;
    const keyPressed$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(share());
    const keyPressedTwice$ = keyPressed$.pipe(
      buffer(keyPressed$.pipe(debounceTime(doubleShiftDelay))),
      filter(l => l.length >= 2),
    );

    this.subscription = keyPressedTwice$.subscribe(([k1, k2]) => {
      if (k1.key !== k2.key) {
        return;
      }
      switch (k1.key) {
        case 'Shift':
          this.router.navigate(['search'], {relativeTo: this.route});
          break;
        case 'Control':
          this.router.navigate(['run'], {relativeTo: this.route});
          break;
      }
    });
  }

  ngOnDestroy() {
    this.openModal?.close();
    this.projectManager.destroy();
    this.subscription.unsubscribe();
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
