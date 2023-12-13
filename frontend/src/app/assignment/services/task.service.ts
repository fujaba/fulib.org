import {Injectable} from '@angular/core';
import {CreateEvaluationDto, Evaluation} from '../model/evaluation';
import Task from '../model/task';

@Injectable()
export class TaskService {
  updatePoints(allTasks: Task[], points: Record<string, number>, evaluations: Record<string, Evaluation | CreateEvaluationDto>, evaluation: Evaluation): void {
    // Clear cache for affected tasks
    const affectedTasks = this.findWithParents(allTasks, evaluation.task);
    for (const task of affectedTasks) {
      delete points[task._id];
    }

    // Restore cache
    for (const task of affectedTasks) {
      this.getTaskPoints(task, evaluations, points);
    }
  }

  find(tasks: Task[], id: string): Task | undefined {
    for (const task of tasks) {
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
    for (const task of tasks) {
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
    // generate a random hex string with 16 characters (64 bit) securely
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  createPointsCache(tasks: Task[], evaluations: Record<string, Evaluation | CreateEvaluationDto>): Record<string, number> {
    const cache = {};
    for (const task of tasks) {
      this.getTaskPoints(task, evaluations, cache);
    }
    return cache;
  }

  getTaskPoints(task: Task, evaluations: Record<string, Evaluation | CreateEvaluationDto>, cache: Record<string, number>): number {
    return cache[task._id] ??= this.calculateTaskPoints(task, evaluations, cache);
  }

  sumPositivePoints(tasks: Task[]): number {
    return tasks.reduce((a, c) => c.points > 0 ? a + c.points : a, 0);
  }

  private calculateTaskPoints(task: Task, evaluations: Record<string, Evaluation | CreateEvaluationDto>, cache: Record<string, number>): number {
    const evaluation = evaluations?.[task._id];
    if (evaluation) {
      for (const child of task.children) {
        this.getTaskPoints(child, evaluations, cache);
      }

      // An evaluation overrides children.
      return evaluation.points;
    }

    if (!task.children.length) {
      // A task with positive points but no children defaults to being failed.
      return 0;
    }

    const positiveChildDeduction = this.sumPositivePoints(task.children);
    // A task with children is granted, by default, its total points minus the total of positive children
    const basePoints = task.points - positiveChildDeduction;
    const childSum = task.children.reduce((a, c) => a + this.getTaskPoints(c, evaluations, cache), 0);
    return basePoints + childSum;
  }
}
