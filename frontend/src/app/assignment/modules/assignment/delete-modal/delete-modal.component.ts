import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import {AssignmentService} from '../../../services/assignment.service';
import {AssignmentStatistics, StatisticsService} from '../statistics.service';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent implements OnInit {
  assignment?: Assignment;
  statistics?: AssignmentStatistics;
  title = '';

  constructor(
    public route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private statisticsService: StatisticsService,
    private toastService: ToastService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => this.assignment = assignment);

    this.route.params.pipe(
      switchMap(({aid}) => this.statisticsService.getAssignmentStatistics(aid)),
    ).subscribe(statistics => this.statistics = statistics);
  }

  delete() {
    const id = this.route.snapshot.params.aid;
    this.assignmentService.delete(id).subscribe(() => {
      this.toastService.warn('Assignment', 'Successfully deleted assignment');
      this.router.navigate(['..'], {relativeTo: this.route});
    }, error => {
      this.toastService.error('Assignment', 'Failed to delete assignment', error);
    });
  }

}
