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
  maxPoints = 0;
  weightedEvaluations = false;

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
      this.maxPoints = this.taskService.sumPositivePoints(assignment.tasks);
      this.stats = statistics;
      for (let taskStats of statistics.tasks) {
        const tasks = this.taskService.findWithParents(assignment.tasks, taskStats.task);
        taskStats._tasks = tasks;
        taskStats._task = tasks[tasks.length - 1];
        taskStats._score = taskStats.points.total / (taskStats._task.points * taskStats.count.total);
      }
    });
  }
}
