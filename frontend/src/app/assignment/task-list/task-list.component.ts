import {Component, Input} from '@angular/core';
import Solution from '../model/solution';
import Task from '../model/task';
import TaskGrading from '../model/task-grading';
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
  @Input() gradings?: Record<string, TaskGrading>;

  outputExpanded: boolean[] = [];

  getTaskPoints(task: Task) {
    if (task.children.length) {
      return task.children.reduce((a, c) => a + this.getTaskPoints(c) - Math.min(c.points, 0), 0);
    }
    return this.gradings?.[task._id]?.points ?? this.results?.[task._id]?.points ?? Math.max(task.points, 0);
  }

  getColorClass(task: Task) {
    if (!this.results) {
      return 'secondary';
    }
    const points = this.getTaskPoints(task);
    if (points === Math.max(task.points, 0)) {
      return 'success';
    }
    if (points === Math.min(task.points, 0)) {
      return 'danger';
    }
    return 'warning';
  }
}
