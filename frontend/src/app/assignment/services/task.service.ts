import {Injectable} from '@angular/core';
import ObjectID from 'bson-objectid';
import Assignment from '../model/assignment';
import {CreateEvaluationDto} from '../model/evaluation';
import Task from '../model/task';

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
      const depth = prefix === '-' ? taskStack.length : prefix.length;
      const list = taskStack[depth - 1];
      const task: Task = {
        _id: id || new ObjectID().toHexString(),
        points: +points,
        description,
        verification: '',
        children: [],
      };
      taskStack.splice(depth, taskStack.length);
      if (prefix !== '-') {
        taskStack.push(task.children);
      }
      list.push(task);
    }

    return taskStack[0];
  }

  renderTasks(tasks: Task[], depth = 0) {
    return tasks.map(t => this.renderTask(t, depth)).join('');
  }

  private renderTask(t: Task, depth: number) {
    if (t.points < 0) {
      return `- ${t.description} (${t.points}P)\n`;
    }
    const children = this.renderTasks(t.children, depth + 1);
    const headlinePrefix = '#'.repeat(depth + 1);
    return `${headlinePrefix} ${t.description} (x/${t.points}P)\n${children}`;
  }
}
