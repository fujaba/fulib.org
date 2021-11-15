import {Component, OnDestroy} from '@angular/core';
import {AssignmentContext} from '../../../services/assignment.context';
import {TaskService} from '../../../services/task.service';

@Component({
  selector: 'app-edit-assignment-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnDestroy {
  markdown?: string;

  constructor(
    private taskService: TaskService,
    public context: AssignmentContext,
  ) {
  }

  ngOnDestroy(): void {
    this.switchMarkdown(false);
  }

  switchMarkdown(markdown: boolean) {
    if (markdown) {
      this.markdown = this.taskService.renderTasks(this.context.assignment.tasks);
    } else if (this.markdown !== undefined) {
      this.context.assignment.tasks = this.taskService.parseTasks(this.markdown);
      this.context.saveDraft();
      this.markdown = undefined;
    }
  }

}
