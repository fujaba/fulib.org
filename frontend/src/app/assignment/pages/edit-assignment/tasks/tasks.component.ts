import { Component, OnInit } from '@angular/core';
import Assignment from '../../../model/assignment';
import {AssignmentContext} from '../../../services/assignment.context';
import {TaskService} from '../../../services/task.service';

@Component({
  selector: 'app-edit-assignment-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
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

  ngOnInit(): void {
  }

  switchMarkdown(markdown: boolean) {
    if (!markdown && this.markdown) {
      this.assignment.tasks = this.taskService.parseTasks(this.markdown);
      this.saveDraft();
      this.markdown = undefined;
    } else {
      this.markdown = this.taskService.renderTasks(this.assignment.tasks);
    }
  }

}
