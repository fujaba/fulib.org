import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DragulaService} from 'ng2-dragula';
import {DndDropEvent} from 'ngx-drag-drop';
import Task from '../model/task';
import TaskResult from '../model/task-result';

@Component({
  selector: 'app-edit-task-list',
  templateUrl: './edit-task-list.component.html',
  styleUrls: ['./edit-task-list.component.scss'],
})
export class EditTaskListComponent implements OnInit, OnDestroy {
  @Input() tasks: Task[];
  @Input() results?: Record<string, TaskResult>;
  @Output() save = new EventEmitter<void>();

  constructor(
    private dragulaService: DragulaService,
  ) {
  }

  ngOnInit(): void {
    this.dragulaService.createGroup('TASKS', {
      moves(el, container, handle): boolean {
        return handle?.classList.contains('handle') ?? false;
      },
    });
  }

  ngOnDestroy() {
    this.dragulaService.destroy('TASKS');
  }

  saveDraft() {
    this.save.emit();
  }

  removeTask(task: Task): void {
    task.deleted = true;
    this.saveDraft();
  }

  restoreTask(task: Task): void {
    task.deleted = false;
    this.saveDraft();
  }

  getColorClass(task: Task): string {
    if (!this.results) {
      return '';
    }
    const result = this.results[task._id];
    if (!result) {
      return '';
    }

    const points = result.points;
    return points === 0 ? 'danger' : 'success';
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
