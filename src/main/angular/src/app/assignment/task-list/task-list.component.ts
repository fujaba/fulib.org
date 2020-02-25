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
}
