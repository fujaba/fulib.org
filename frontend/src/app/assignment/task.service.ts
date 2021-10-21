import {Injectable} from '@angular/core';
import {CreateEvaluationDto} from './model/evaluation';
import Task from './model/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  createPointsCache(tasks: Task[], evaluations: Record<string, CreateEvaluationDto>): Record<string, number> {
    const cache = {};
    for (let task of tasks) {
      this.getTaskPoints(task, evaluations, cache);
    }
    return cache;
  }

  private getTaskPoints(task: Task, evaluations: Record<string, CreateEvaluationDto>, cache: Record<string, number>): number {
    return cache[task._id] ??= this.calculateTaskPoints(task, evaluations, cache);
  }

  private calculateTaskPoints(task: Task, evaluations: Record<string, CreateEvaluationDto>, cache: Record<string, number>): number {
    if (task.children.length) {
      return task.children.reduce((a, c) => a + this.getTaskPoints(c, evaluations, cache) - Math.min(c.points, 0), 0);
    }
    return evaluations?.[task._id]?.points ?? Math.max(task.points, 0);
  }
}
