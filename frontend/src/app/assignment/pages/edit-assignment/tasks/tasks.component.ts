import {Component, OnDestroy} from '@angular/core';
import Assignment from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';
import {TaskService} from '../../../services/task.service';

@Component({
  selector: 'app-edit-assignment-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnDestroy {
  assignment: Assignment;
  markdown?: string;
  saveDraft: () => void;

  constructor(
    private taskService: TaskService,
    context: AssignmentContext,
  ) {
    this.assignment = context.assignment;
    this.saveDraft = context.saveDraft;
  }

  ngOnDestroy(): void {
    this.switchMarkdown(false);
  }

  switchMarkdown(markdown: boolean) {
    if (markdown) {
      this.markdown = this.taskService.renderTasks(this.assignment.tasks);
    } else if (this.markdown !== undefined) {
      this.assignment.tasks = this.taskService.parseTasks(this.markdown);
      this.saveDraft();
      this.markdown = undefined;
    }
  }

}
