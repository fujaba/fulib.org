import {Injectable} from '@angular/core';
import ObjectID from 'bson-objectid';
import {CreateEvaluationDto} from '../model/evaluation';
import Task from '../model/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  find(tasks: Task[], id: string): Task | undefined {
    for (let task of tasks) {
      if (task._id === id) {
        return task;
      }
      const child = this.find(task.children, id);
      if (child) {
        return child;
      }
    }
    return undefined;
  }

  findWithParents(tasks: Task[], id: string): Task[] {
    for (let task of tasks) {
      if (task._id === id) {
        return [task];
      }
      const child = this.findWithParents(task.children, id);
      if (child.length) {
        return [task, ...child];
      }
    }
    return [];
  }

  generateID(): string {
    return new ObjectID().toHexString();
  }

  createPointsCache(tasks: Task[], evaluations: Record<string, CreateEvaluationDto>): Record<string, number> {
    const cache = {};
    for (let task of tasks) {
      this.getTaskPoints(task, evaluations, cache);
    }
    return cache;
  }

  getTaskPoints(task: Task, evaluations: Record<string, CreateEvaluationDto>, cache: Record<string, number>): number {
    return cache[task._id] ??= this.calculateTaskPoints(task, evaluations, cache);
  }

  private calculateTaskPoints(task: Task, evaluations: Record<string, CreateEvaluationDto>, cache: Record<string, number>): number {
    const evaluation = evaluations?.[task._id];
    if (evaluation) {
      // An evaluation overrides children.
      return evaluation.points;
    }

    if (!task.children.length) {
      // A task with positive points but no children defaults to being failed.
      return 0;
    }

    const positiveChildDeduction = task.children.reduce((a, c) => c.points > 0 ? a + c.points : a, 0);
    // A task with children is granted, by default, its total points minus the total of positive children
    const basePoints = task.points - positiveChildDeduction;
    const childSum = task.children.reduce((a, c) => a + this.getTaskPoints(c, evaluations, cache), 0);
    return basePoints + childSum;
  }
}
