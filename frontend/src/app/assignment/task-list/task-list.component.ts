import {Component, Input} from '@angular/core';
import Assignment from '../model/assignment';
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
  @Input() assignment?: Assignment;
  @Input() solution?: Solution;
  @Input() results?: Record<string, TaskResult>;
  @Input() gradings?: Record<string, TaskGrading>;

  outputExpanded: boolean[] = [];

  getTaskPoints(task: Task) {
    return this.gradings?.[task._id]?.points ?? this.results?.[task._id]?.points ?? 0;
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
