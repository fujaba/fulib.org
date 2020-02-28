import {Component, OnInit, ViewChild} from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import Task from '../model/task';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  @ViewChild('successModal', {static: true}) successModal;

  importFile: File;

  collapse = {
    solution: false,
    templateSolution: false,
  };

  title: string;
  author: string;
  email: string;
  deadlineDate: Date;
  deadlineTime: Date;
  description: string;
  solution: string;
  templateSolution: string;

  tasks: Task[] = [];

  submitting = false;
  id: string;
  token: string;

  // TODO does not work with Angular Universal
  baseURL = window.location.origin;

  constructor(
    private assignmentService: AssignmentService,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit() {
    const draft = this.assignmentService.draft;
    if (draft) {
      this.setAssignment(draft);
    }
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
      templateSolution: this.templateSolution,
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
    this.templateSolution = a.templateSolution;
  }

  saveDraft() {
    this.assignmentService.draft = this.getAssignment();
  }

  onImport() {
    this.assignmentService.upload(this.importFile).subscribe(result => {
      this.setAssignment(result);
      this.assignmentService.draft = result;
    });
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

  submit() {
    this.submitting = true;
    this.assignmentService.submit(this.getAssignment())
      .subscribe(result => {
        this.submitting = false;
        this.id = result.id;
        this.token = result.token;
        this.modalService.open(this.successModal, {ariaLabelledBy: 'successModalLabel', size: 'xl'});
      });
  }
}
