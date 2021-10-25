import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DndDropEvent} from 'ngx-drag-drop';
import Task from '../../model/task';
import {AssignmentContext} from '../../services/assignment.context';
import {TaskService} from '../../services/task.service';

@Component({
  selector: 'app-edit-task-list',
  templateUrl: './edit-task-list.component.html',
  styleUrls: ['./edit-task-list.component.scss'],
})
export class EditTaskListComponent {
  @Input() parent?: string;
  @Input() tasks: Task[];
  @Output() save = new EventEmitter<void>();

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    public context: AssignmentContext,
  ) {
  }

  saveDraft() {
    this.save.emit();
  }

  addTask(): void {
    const id = this.taskService.generateID();
    this.router.navigate(['tasks', id], {queryParams: {parent: this.parent}, relativeTo: this.route});
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
