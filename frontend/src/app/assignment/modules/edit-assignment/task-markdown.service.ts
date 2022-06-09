import {Injectable} from '@angular/core';
import {extractTaskItem, TASK_ITEM_PATTERN} from '../../../../modes/task-list-codemirror-mode';
import Task from '../../model/task';
import {TaskService} from '../../services/task.service';

@Injectable({
  providedIn: 'root',
})
export class TaskMarkdownService {
  constructor(
    private taskService: TaskService,
  ) {
  }

  parseTasks(markdown: string): Task[] {
    // # Assignment 1 (xP/100P)
    // ## Task 1 (xP/30P)
    // - Something wrong (-1P)
    const taskStack: Task[][] = [[]];
    for (const line of markdown.split('\n')) {
      const match = line.match(TASK_ITEM_PATTERN);
      if (!match) {
        continue;
      }

      const {prefix, description, points, _id, glob} = extractTaskItem(match);
      const task: Task = {
        _id: _id || this.taskService.generateID(),
        points: +points,
        description,
        glob,
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
    const {_id, glob} = t;
    const extra = JSON.stringify({_id, glob});
    if (t.points < 0 || !t.children || t.children.length === 0) {
      return `- ${t.description} (${t.points}P)<!--${extra}-->\n`;
    }
    const children = this.renderTasks(t.children, depth + 1);
    const headlinePrefix = '#'.repeat(depth + 2);
    return `${headlinePrefix} ${t.description} (x/${t.points}P)<!--${extra}-->\n${children}`;
  }
}
