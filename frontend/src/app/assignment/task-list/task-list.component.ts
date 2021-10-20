import {Component, Input} from '@angular/core';
import {CreateEvaluationDto} from '../model/evaluation';
import Solution from '../model/solution';
import Task from '../model/task';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent {
  @Input() tasks?: Task[];
  @Input() solution?: Solution;
  @Input() evaluations?: Record<string, CreateEvaluationDto>;

  outputExpanded: boolean[] = [];

  getTaskPoints(task: Task) {
    return this.evaluations?.[task._id]?.points ?? 0;
  }

  getColorClass(task: Task) {
    if (!this.evaluations) {
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
