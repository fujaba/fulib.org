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
      get: t => t._pointsAvg,
      render: n => n.toFixed(2),
    },
    timeAvg: {
      title: 'Average Evaluation Time',
      label: 'per Evaluation',
      get: t => t.timeAvg,
      render: n => this.durationPipe.transform(n),
    },
    codeSearchEffectiveness: {
      title: 'Code Search Effectiveness',
      label: 'of Evaluations by Code Search',
      get: t => t._codeSearchEffectiveness,
      render: n => (n * 100).toFixed(0) + '%',
    },
    codeSearchTimeSavings: {
      title: 'Code Search Time Savings',
      label: 'Saved by Code Search',
      get: t => t._codeSearchTimeSavings,
      render: n => this.durationPipe.transform(n),
    },
  } as const;
  visibleProps = new Set<TaskStatisticsKey>(['score', 'codeSearchTimeSavings']);
  sortProp?: TaskStatisticsKey;

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
        taskStats._score = (taskStats.points.total / (taskStats._task.points * taskStats.count.total)) || 0;
        taskStats._codeSearchEffectiveness = (taskStats.count.codeSearch / taskStats.count.total) || 0;
        taskStats._codeSearchTimeSavings = taskStats.timeAvg * taskStats.count.codeSearch;
        taskStats._pointsAvg = (taskStats.points.total / taskStats.count.total) || 0;
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
    let order = 1;
    if (key === this.sortProp) {
      order = -1;
      this.sortProp = undefined;
    } else {
      this.sortProp = key;
    }
    const prop = this.taskProps[key];
    this.stats?.tasks.sort((a, b) => order * (prop.get(a) - prop.get(b)));
  }
}
