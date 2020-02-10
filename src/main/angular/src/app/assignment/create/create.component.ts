import {Component, OnInit} from '@angular/core';
import Task from '../model/task';
import Assignment from '../model/assignment';

import {saveAs} from 'file-saver';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  importFile: File;

  title: string;
  author: string;
  email: string;
  deadlineDate: string;
  deadlineTime: string;
  description: string = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
laborum.`.replace(/\s+/g, ' ');
  solution: string;

  tasks: Task[] = [];

  constructor() {
  }

  ngOnInit() {
  }

  getAssignment(): Assignment {
    return {
      id: undefined,
      token: undefined,
      title: this.title,
      description: this.description,
      descriptionHtml: undefined,
      author: this.author,
      email: this.email,
      deadline: new Date(this.deadlineDate + ' ' + this.deadlineTime),
      solution: this.solution,
      tasks: this.tasks,
    } as Assignment;
  }

  onImport() {
  }

  onExport() {
    const assignment = this.getAssignment();
    const replacer = (k, v) => v instanceof Date ? v.toISOString() : v;
    const content = JSON.stringify(assignment, replacer, '  ');
    saveAs(new Blob([content], {type: 'application/json'}), this.title + '.json');
  }

  addTask() {
    this.tasks.push(new Task());
  }

  clearTasks() {
    this.tasks.length = 0;
  }

  removeTask(id: number) {
    this.tasks.splice(id, 1);
  }
}
