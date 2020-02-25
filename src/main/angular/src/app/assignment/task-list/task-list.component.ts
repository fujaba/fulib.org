import {Component, Input, OnInit} from '@angular/core';
import Assignment from '../model/assignment';
import TaskResult from '../model/task-result';
import Solution from '../model/solution';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  @Input() assignment?: Assignment;
  @Input() solution?: Solution;
  @Input() results?: TaskResult[];

  constructor() {
  }

  ngOnInit() {
  }

  getColorClass(taskID: number) {
    if (!this.results) {
      return 'secondary';
    }
    const points = this.results[taskID].points;
    const maxPoints = this.assignment.tasks[taskID].points;
    if (points === maxPoints) {
      return 'success';
    }
    if (points === 0) {
      return 'danger';
    }
    return 'warning';
  }
}
