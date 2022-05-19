import {Component, Input} from '@angular/core';
import {DndDropEvent} from 'ngx-drag-drop';
import Task from '../../../model/task';
import {AssignmentContext} from '../../../services/assignment.context';
import {TaskService} from '../../../services/task.service';

@Component({
  selector: 'app-edit-task-list',
  templateUrl: './edit-task-list.component.html',
  styleUrls: ['./edit-task-list.component.scss'],
})
export class EditTaskListComponent {
  @Input() parent?: string;
  @Input() tasks: Task[];

  nextId: string;

  constructor(
    private taskService: TaskService,
    public context: AssignmentContext,
  ) {
    this.generateId();
  }

  generateId(): void {
    this.nextId = this.taskService.generateID();
  }

  saveDraft() {
    this.context.saveDraft();
  }

  removeTask(task: Task): void {
    task.deleted = true;
    this.saveDraft();
  }

  restoreTask(task: Task): void {
    task.deleted = false;
    this.saveDraft();
  }

  dragged(task: Task) {
    this.tasks.removeFirst(t => t === task);
  }

  drop(event: DndDropEvent) {
    if (event.index !== undefined) {
      this.tasks.splice(event.index, 0, event.data);
      this.saveDraft();
    }
  }
}
