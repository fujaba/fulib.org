import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalComponent, ToastService} from 'ng-bootstrap-ext';
import {switchMap} from 'rxjs/operators';
import {Project} from '../../model/project';
import {ProjectService} from '../../services/project.service';


@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent implements OnInit {
  project?: Project;
  back: string;

  deleting = false;

  constructor(
    public activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private toastService: ToastService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({back}) => this.back = back);
    this.activatedRoute.params.pipe(
      switchMap(({id}) => this.projectService.get(id)),
    ).subscribe(project => {
      this.project = project;
    });
  }

  delete(modal: ModalComponent): void {
    if (!this.project) {
      return;
    }

    this.deleting = true;
    this.projectService.delete(this.project).subscribe(() => {
      this.deleting = false;
      modal.close();
      this.router.navigate(['/projects']);
      this.toastService.warn('Delete Project', 'Successfully deleted project');
    }, error => {
      this.deleting = false;
      this.toastService.error('Delete Project', 'Failed to delete project', error);
    });
  }
}
