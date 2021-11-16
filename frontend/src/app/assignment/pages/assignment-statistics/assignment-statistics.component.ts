import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Task from '../../model/task';
import {AssignmentService} from '../../services/assignment.service';
import {SolutionService} from '../../services/solution.service';
import {TaskService} from '../../services/task.service';

@Component({
  selector: 'app-assignment-statistics',
  templateUrl: './assignment-statistics.component.html',
  styleUrls: ['./assignment-statistics.component.scss'],
})
export class AssignmentStatisticsComponent implements OnInit {
  results: { name: string, series: { name: string, value: number }[]; }[] = [];

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private taskService: TaskService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => forkJoin([
        this.assignmentService.get(aid),
        this.solutionService.getEvaluations(aid),
      ])),
    ).subscribe(([assignment, evaluations]) => {
      // count by task
      const taskTotals = new Map<string, number>();
      for (let evaluation of evaluations) {
        taskTotals.set(evaluation.task, (taskTotals.get(evaluation.task) ?? 0) + evaluation.points);
      }

      const sortedTaskIds = Array.from(taskTotals)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => key)
      ;

      // group by parent
      const groupedTasks = new Map<string, Task[]>();
      for (const taskId of sortedTaskIds) {
        const parents = this.taskService.findWithParents(assignment.tasks, taskId);
        const task = parents[parents.length - 1];
        const parent = parents.length === 1 ? 'root' : parents[0]._id;
        const list = groupedTasks.get(parent);
        if (list) {
          list.push(task);
        } else {
          groupedTasks.set(parent, [task]);
        }
      }

      this.results = Array.from(groupedTasks.entries()).map(([parentId, tasks]) => ({
        name: parentId === 'root' ? assignment.title : assignment.tasks.find(s => s._id === parentId)!.description,
        series: tasks.map(task => ({
          name: task.description,
          value: taskTotals.get(task._id)! / task.points,
        })),
      }));
    });
  }
}
