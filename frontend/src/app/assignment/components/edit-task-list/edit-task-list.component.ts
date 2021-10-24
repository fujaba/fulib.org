import {Component, EventEmitter, Input, Output} from '@angular/core';
import ObjectID from 'bson-objectid';
import {DndDropEvent} from 'ngx-drag-drop';
import {CreateEvaluationDto} from '../../model/evaluation';
import Task from '../../model/task';

@Component({
  selector: 'app-edit-task-list',
  templateUrl: './edit-task-list.component.html',
  styleUrls: ['./edit-task-list.component.scss'],
})
export class EditTaskListComponent {
  @Input() tasks: Task[];
  @Input() evaluations?: Record<string, CreateEvaluationDto>;
  @Output() save = new EventEmitter<void>();

  constructor() {
  }

  saveDraft() {
    this.save.emit();
  }

  addTask(): void {
    const id = new ObjectID().toHexString();
    this.tasks.push({
      _id: id,
      description: '',
      points: 0,
      verification: '',
      collapsed: false,
      deleted: false,
      children: [],
    });
    if (this.evaluations) {
      this.evaluations[id] = {
        task: id,
        points: 0,
        remark: '',
        author: '',
        snippets: [],
      };
    }
    this.saveDraft();
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

  calcPoints(task: Task) {
    task.points = task.children.reduce((a, c) => a + Math.abs(c.points), 0);
  }
}
