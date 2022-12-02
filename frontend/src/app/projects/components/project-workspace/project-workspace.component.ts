import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Toast, ToastService} from 'ng-bootstrap-ext';
import {ClipboardService} from 'ngx-clipboard';
import {switchMap, tap} from 'rxjs/operators';
import {Container} from '../../model/container';

import {Project} from '../../model/project';
import {ContainerService} from '../../services/container.service';

@Component({
  selector: 'app-project-workspace',
  templateUrl: './project-workspace.component.html',
  styleUrls: ['./project-workspace.component.scss'],
})
export class ProjectWorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild('loadingModal', {static: true}) loadingModal: TemplateRef<any>;

  openModal?: NgbModalRef;

  project?: Project;
  container?: Container;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
      }),
      switchMap(({id}) => this.containerService.create(id)),
    ).subscribe(container => {
      this.container = container;
      this.openModal?.close();
      this.toastService.add({
        class: 'bg-primary',
        title: 'Container Launched',
        delay: 20000,
        body: `Your container is ready to use. If prompted for a password, use this token: ${container.token}`,
        actions: [
          {name: 'Copy', run: () => this.clipboardService.copy(container.token)},
        ],
      });
      if (container.isNew) {
        this.router.navigate(['setup'], {relativeTo: this.route});
      }
    });
  }

  ngOnDestroy() {
    this.openModal?.close();
  }
}
