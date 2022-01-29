import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {DurationPipe} from '../../../../shared/duration.pipe';
import {AssignmentService} from '../../../services/assignment.service';
import {TaskService} from '../../../services/task.service';
import {AssignmentStatistics, StatisticsService} from '../statistics.service';


type TaskStatisticsKey = keyof StatisticsComponent['taskProps'];

@Component({
  selector: 'app-assignment-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  stats?: AssignmentStatistics;
  maxPoints = 0;
  weightedEvaluations = false;

  taskProps = {
    score: {
      title: 'Rating',
      label: 'of Points on Average',
      get: t => t._score,
      render: n => (n * 100).toFixed(0) + '%',
    },
    pointsAvg: {
      title: 'Average Points',
      label: 'Points',
      get: t => (t.points.total / t.count.total),
      render: n => n.toFixed(2),
    },
    timeAvg: {
      title: 'Average Evaluation Time',
      label: 'per Evaluation',
      get: t => t.timeAvg / 1000,
      render: n => this.durationPipe.transform(n),
    },
    codeSearchEffectiveness: {
      title: 'Code Search Effectiveness',
      label: 'of Evaluations by Code Search',
      get: t => t.count.codeSearch / t.count.total,
      render: n => (n * 100).toFixed(0) + '%',
    },
    codeSearchTimeSavings: {
      title: 'Code Search Time Savings',
      label: 'Saved by Code Search',
      get: t => t.timeAvg * t.count.codeSearch / 1000,
      render: n => this.durationPipe.transform(n),
    },
  } as const;
  visibleProps = new Set<TaskStatisticsKey>();

  constructor(
    private assignmentService: AssignmentService,
    private statisticsService: StatisticsService,
    private taskService: TaskService,
    private durationPipe: DurationPipe,
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

  toggleVisibility(key: TaskStatisticsKey) {
    if (this.visibleProps.has(key)) {
      this.visibleProps.delete(key);
    } else {
      this.visibleProps.add(key);
    }
  }

  sortTasks(key: TaskStatisticsKey) {
    const prop = this.taskProps[key];
    this.stats?.tasks.sort((a, b) => prop.get(a) - prop.get(b));
  }
}
