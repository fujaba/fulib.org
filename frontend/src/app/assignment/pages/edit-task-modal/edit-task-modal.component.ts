import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';
import Task from '../../model/task';
import {AssignmentContext} from '../../services/assignment.context';
import {TaskService} from '../../services/task.service';

@Component({
  selector: 'app-edit-task-modal',
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.scss'],
})
export class EditTaskModalComponent implements OnInit {
  parent?: string;
  task: Task;

  constructor(
    private taskService: TaskService,
    public route: ActivatedRoute,
    public context: AssignmentContext,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      map(({task}) => {
        const existing = this.taskService.find(this.context.assignment.tasks, task);
        return existing ? {...existing} : this.createNew(task);
      }),
    ).subscribe(task => {
      this.task = task;
    });
  }

  private createNew(_id: string): Task {
    return {
      _id,
      description: '',
      points: 0,
      verification: '',
      children: [],
    };
  }

  calcPoints(task: Task) {
    task.points = task.children.reduce((a, c) => a + Math.abs(c.points), 0);
  }

  save() {
    const parentId = this.route.snapshot.queryParams.parent;
    const assignment = this.context.assignment;
    const parent = parentId ? this.taskService.find(assignment.tasks, parentId) : undefined;
    const list = parent ? parent.children : assignment.tasks;

    const index = list.findIndex(t => t._id === this.task._id);
    if (index >= 0) {
      list[index] = this.task;
    } else {
      list.push(this.task);
    }

    // TODO Save Draft
  }
}
