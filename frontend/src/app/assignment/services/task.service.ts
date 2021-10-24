import {Injectable} from '@angular/core';
import ObjectID from 'bson-objectid';
import {CreateEvaluationDto} from '../model/evaluation';
import Task from '../model/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
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

  private getTaskPoints(task: Task, evaluations: Record<string, CreateEvaluationDto>, cache: Record<string, number>): number {
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

  parseTasks(markdown: string): Task[] {
    // # Assignment 1 (xP/100P)
    // ## Task 1 (xP/30P)
    // - Something wrong (-1P)
    const pattern = /(#+|-)\s+(.*)\s+\((?:[x\d]+P?\/)?(-?\d+)P?\)(?:\s*<!--([a-zA-Z0-9])-->)?/;
    const taskStack: Task[][] = [[]];
    for (const line of markdown.split('\n')) {
      const match = line.match(pattern);
      if (!match) {
        continue;
      }

      const [, prefix, description, points, id] = match;
      const task: Task = {
        _id: id || this.generateID(),
        points: +points,
        description,
        verification: '',
        children: [],
        collapsed: true,
      };
      switch (prefix) {
        case '-':
          taskStack[taskStack.length - 1].push(task);
          break;
        case '#':
          break;
        default:
          taskStack[prefix.length - 2].push(task);
          taskStack.splice(prefix.length - 1, taskStack.length, task.children);
          break;
      }
    }

    return taskStack[0];
  }

  renderTasks(tasks: Task[], depth = 0) {
    return tasks.map(t => this.renderTask(t, depth)).join('');
  }

  private renderTask(t: Task, depth: number) {
    if (t.deleted) {
      return '';
    }
    if (t.points < 0) {
      return `- ${t.description} (${t.points}P)<!--${t._id}-->\n`;
    }
    const children = this.renderTasks(t.children, depth + 1);
    const headlinePrefix = '#'.repeat(depth + 2);
    return `${headlinePrefix} ${t.description} (x/${t.points}P)<!--${t._id}-->\n${children}`;
  }
}
