import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {switchMap} from 'rxjs/operators';
import {ReadAssignmentDto} from '../../../model/assignment';
import {AssignmentService} from '../../../services/assignment.service';
import {AssignmentStatistics, StatisticsService} from '../statistics.service';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
  standalone: false,
})
export class DeleteModalComponent implements OnInit {
  assignment?: ReadAssignmentDto;
  statistics?: AssignmentStatistics;
  title = '';

  constructor(
    public route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private statisticsService: StatisticsService,
    private toastService: ToastService,
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
    const {aid} = this.route.snapshot.params;
    this.assignmentService.delete(aid).subscribe(() => {
      this.toastService.warn('Assignment', 'Successfully deleted assignment');
    }, error => {
      this.toastService.error('Assignment', 'Failed to delete assignment', error);
    });
  }

}
