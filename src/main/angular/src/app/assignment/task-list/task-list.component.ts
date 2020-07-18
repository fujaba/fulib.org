import {Component, Input, OnInit} from '@angular/core';
import Assignment from '../model/assignment';
import TaskResult from '../model/task-result';
import Solution from '../model/solution';
import TaskGrading from '../model/task-grading';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  @Input() assignment?: Assignment;
  @Input() solution?: Solution;
  @Input() results?: TaskResult[];
  @Input() gradings?: TaskGrading[];

  outputExpanded: boolean[] = []

  constructor() {
  }

  ngOnInit() {
  }

  getTaskPoints(taskID: number) {
    if (this.gradings) {
      for (let i = this.gradings.length - 1; i >= 0; i--) {
        const grading = this.gradings[i];
        if (grading.taskID === taskID) {
          return grading.points;
        }
      }
    }
    return this.results[taskID].points;
  }

  getColorClass(taskID: number) {
    if (!this.results) {
      return 'secondary';
    }
    const points = this.getTaskPoints(taskID);
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
