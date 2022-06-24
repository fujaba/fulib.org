import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {switchMap, tap} from 'rxjs/operators';
import {Container} from '../../model/container';

import {Project} from '../../model/project';
import {ContainerService} from '../../services/container.service';
import {LocalProjectService} from '../../services/local-project.service';
import {ProjectService} from '../../services/project.service';

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

  progressLabels = progressLabels;
  progressOrder = progressOrder;
  progress: Partial<Record<keyof typeof progressLabels, true>> = {};

  openModal?: NgbModalRef;

  project?: Project;
  container?: Container;

  showAlert = true;

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
      switchMap(({id}) => this.projectService.get(id)),
      tap(project => {
        this.project = project;
        this.progress.metadata = true;
      }),
      switchMap(project => project.local ? this.containerService.createLocal(project) : this.containerService.create(project.id)),
      tap(container => {
        this.container = container;
        this.progress.container = true;
      }),
    ).subscribe(() => {
      this.openModal?.close();
      this.showAlert = true;
    });
  }

  ngOnDestroy() {
    this.openModal?.close();
  }
}
