import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Toast, ToastService} from 'ng-bootstrap-ext';
import {ClipboardService} from 'ngx-clipboard';
import {switchMap, tap} from 'rxjs/operators';
import {Container} from '../../model/container';

import {Project} from '../../model/project';
import {ContainerService} from '../../services/container.service';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private containerService: ContainerService,
    private ngbModal: NgbModal,
    private toastService: ToastService,
    private clipboardService: ClipboardService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      tap(() => {
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
      switchMap(project => this.containerService.create(project.id)),
      tap(container => {
        this.container = container;
        this.progress.container = true;
      }),
    ).subscribe(container => {
      this.openModal?.close();
      const toast: Toast = {
        class: 'bg-primary',
        title: 'Container Launched',
        delay: 20000,
        body: `Your container is ready to use. If prompted for a password, use the token: ${container.token}`,
        actions: [
          {name: 'Copy', run: () => this.clipboardService.copy(container.token)},
          {name: 'Close', run: () => this.toastService.remove(toast)},
        ],
      };
      this.toastService.add(toast);
      if (this.container?.isNew) {
        this.router.navigate(['setup'], {relativeTo: this.route});
      }
    });
  }

  ngOnDestroy() {
    this.openModal?.close();
  }
}
