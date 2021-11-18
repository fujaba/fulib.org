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

      const {prefix, description, points, id} = extractTaskItem(match);
      const task: Task = {
        _id: id || this.taskService.generateID(),
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
