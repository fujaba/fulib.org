import {Component, Input} from '@angular/core';
import {Evaluation} from '../model/evaluation';
import Solution from '../model/solution';
import Task from '../model/task';
import TaskResult from '../model/task-result';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input() tasks?: Task[];
  @Input() solution?: Solution;
  @Input() results?: Record<string, TaskResult>;
  @Input() evaluations?: Record<string, Evaluation>;

  outputExpanded: boolean[] = [];

  getTaskPoints(task: Task) {
    return this.evaluations?.[task._id]?.points ?? this.results?.[task._id]?.points ?? 0;
  }

  getColorClass(task: Task) {
    if (!this.results) {
      return 'secondary';
    }
    const points = this.getTaskPoints(task);
    const maxPoints = task.points;
    if (points === maxPoints) {
      return 'success';
    }
    if (points === 0) {
      return 'danger';
    }
    return 'warning';
  }
}
