import {Component, OnInit} from '@angular/core';
import Task from '../model/task';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';

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
  deadlineDate: Date;
  deadlineTime: Date;
  description: string;
  solution: string;

  tasks: Task[] = [];

  constructor(
    private assignmentService: AssignmentService,
  ) {
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
      deadline: new Date(this.deadlineDate.toDateString() + ' ' + this.deadlineTime.toTimeString()),
      solution: this.solution,
      tasks: this.tasks,
    } as Assignment;
  }

  setAssignment(a: Assignment): void {
    this.title = a.title;
    this.description = a.description;
    this.author = a.author;
    this.email = a.email;
    this.deadlineDate = a.deadline;
    this.deadlineTime = a.deadline;
    this.tasks = a.tasks;
    this.solution = a.solution;
  }

  onImport() {
    this.assignmentService.upload(this.importFile)
      .subscribe(result => this.setAssignment(result));
  }

  onExport() {
    const assignment = this.getAssignment();
    this.assignmentService.download(assignment);
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
