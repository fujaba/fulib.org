import {Pipe, PipeTransform} from '@angular/core';
import Task from './model/task';

@Pipe({
  name: 'taskColor',
})
export class TaskColorPipe implements PipeTransform {
  transform(task: Task, points?: number): string {
    if (points === undefined) {
      return 'secondary';
    }
    if (points === Math.max(task.points, 0)) {
      return 'success';
    }
    if (points === Math.min(task.points, 0)) {
      return 'danger';
    }
    return 'warning';
  }

}
