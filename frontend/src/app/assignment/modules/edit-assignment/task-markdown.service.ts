import {Injectable} from '@angular/core';
import {extractTaskItem, TASK_ITEM_PATTERN} from '../../../../modes/task-list-codemirror-mode';
import Task from '../../model/task';
import {TaskService} from '../../services/task.service';

@Injectable()
export class TaskMarkdownService {
  constructor(
    private taskService: TaskService,
  ) {
  }

  parseTasks(markdown: string): Task[] {
    // # Assignment 1 (100P)
    // ## Task 1 (30P)
    // - Something wrong (-1P)
    const taskStack: Task[][] = [[]];
    for (const line of markdown.split('\n')) {
      const match = line.match(TASK_ITEM_PATTERN);
      if (!match) {
        continue;
      }

      // exclude __proto__ from rest to avoid prototype pollution
      const {prefix, points, _id, __proto__, ...rest} = extractTaskItem(match);
      const task: Task = {
        ...rest,
        _id: _id || this.taskService.generateID(),
        points: +points,
        children: [],
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
    let result = '';
    let lastTaskWasHeadline = false;
    for (const task of tasks) {
      const line = this.renderTask(task, depth, lastTaskWasHeadline);
      result += line;
      lastTaskWasHeadline = line.startsWith('#');
    }
    return result;
  }

  private renderTask(task: Task, depth: number, asHeadline: boolean) {
    const {children, deleted, description, points, ...rest} = task;
    if (deleted) {
      return '';
    }
    const extra = JSON.stringify(rest);
    // If the previous task had children, we need to write this as a new headline.
    // Otherwise, it would end up as a subtask of the previous task without a way to distinguish it.
    if (!asHeadline && (points < 0 || !children || children.length === 0)) {
      return `- ${description} (${points}P)<!--${extra}-->\n`;
    }
    const childrenMd = this.renderTasks(children, depth + 1);
    const headlinePrefix = '#'.repeat(depth + 2);
    return `${headlinePrefix} ${description} (${points}P)<!--${extra}-->\n${childrenMd}`;
  }
}
