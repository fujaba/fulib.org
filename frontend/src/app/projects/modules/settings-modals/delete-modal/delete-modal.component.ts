import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Project} from '../../../model/project';
import {ProjectService} from '../../../services/project.service';

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

  delete(): void {
    this.deleting = true;
    this.projectService.delete(this.project!).subscribe(() => {
      this.deleting = false;
      this.router.navigate(['/projects']);
    });
  }
}
