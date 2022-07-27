import {HttpClient} from '@angular/common/http';
import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, Type, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {forkJoin, Subscription} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {Container} from '../../model/container';

import {Project} from '../../model/project';
import {ContainerService} from '../../services/container.service';
import {LocalProjectService} from '../../services/local-project.service';
import {ProjectService} from '../../services/project.service';
import RFB from '@novnc/novnc/core/rfb.js';


const progressLabels = {
  metadata: 'Loading Project Metadata',
  container: 'Launching Container',
};

const progressOrder: (keyof typeof progressLabels)[] = [
  'metadata',
  'container',
];

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss'],
})
export class ProjectWorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild('loadingModal', {static: true}) loadingModal: TemplateRef<any>;
  @ViewChild('screen') vncScreen : ElementRef;

  progressLabels = progressLabels;
  progressOrder = progressOrder;
  progress: Partial<Record<keyof typeof progressLabels, true>> = {};

  openModal?: NgbModalRef;

  project?: Project;
  container?: Container;

  showAlert = true;

  rfb: RFB;

  constructor(
    private route: ActivatedRoute,
    private localProjectService: LocalProjectService,
    private projectService: ProjectService,
    private containerService: ContainerService,
    private ngbModal: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      tap(() => {
        this.showAlert = false;
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
            this.container = container;
            this.progress.container = true;

            this.startVncClient(container.vncUrl);

            return [localProject, container] as const;
          }));
        } else {
          return forkJoin([
            this.projectService.get(id).pipe(tap(project => {
              this.project = project;
              this.progress.metadata = true;
            })),
            this.containerService.create(id).pipe(tap(container => {
              this.container = container;
              this.progress.container = true;
            })),
          ]);
        }
      }),
    ).subscribe(() => {
      this.openModal?.close();
      this.showAlert = true;
    });
  }

  ngOnDestroy() {
    this.openModal?.close();
  }

  private startVncClient(vncUrl: string) {
    vncUrl = vncUrl.replace('http', 'ws');
    this.rfb = new RFB(this.vncScreen.nativeElement, vncUrl);
  }

}
