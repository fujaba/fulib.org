import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {AssignmentService} from '../../../services/assignment.service';
import {TaskService} from '../../../services/task.service';
import {AssignmentStatistics, StatisticsService} from '../statistics.service';


@Component({
  selector: 'app-assignment-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  stats?: AssignmentStatistics;

  constructor(
    private assignmentService: AssignmentService,
    private statisticsService: StatisticsService,
    private taskService: TaskService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => forkJoin([
        this.assignmentService.get(aid),
        this.statisticsService.getAssignmentStatistics(aid),
      ])),
    ).subscribe(([assignment, statistics]) => {
      this.stats = statistics;
      for (let task of statistics.tasks) {
        task.resolved = this.taskService.findWithParents(assignment.tasks, task.task);
      }
    });
  }
}
