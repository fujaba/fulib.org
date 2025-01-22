import {Component, OnDestroy} from '@angular/core';
import {AssignmentContext} from '../../../services/assignment.context';
import {TaskMarkdownService} from '../task-markdown.service';
import {TaskService} from "../../../services/task.service";

@Component({
  selector: 'app-edit-assignment-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  standalone: false,
})
export class TasksComponent implements OnDestroy {
  markdown?: string;

  constructor(
    private taskMarkdownService: TaskMarkdownService,
    private taskService: TaskService,
    public context: AssignmentContext,
  ) {
  }

  ngOnDestroy(): void {
    this.switchMarkdown(false);
  }

  switchMarkdown(markdown: boolean) {
    if (markdown === (this.markdown !== undefined)) {
      return;
    }
    if (markdown) {
      this.markdown = this.taskMarkdownService.renderTasks(this.context.assignment.tasks);
    } else if (this.markdown !== undefined) {
      this.context.assignment.tasks = this.taskMarkdownService.parseTasks(this.markdown);
      this.context.saveDraft();
      this.markdown = undefined;
    }
  }

  setPassingPoints() {
    const tasks = this.markdown ? this.taskMarkdownService.parseTasks(this.markdown) : this.context.assignment.tasks;
    this.context.assignment.passingPoints = this.taskService.sumPositivePoints(tasks) / 2;
    this.context.saveDraft();
  }
}
