import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DragulaService} from 'ng2-dragula';
import {Marker} from '../../scenario-editor.service';

import Task from '../model/task';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import TaskResult from '../model/task-result';
import {UserService} from "../../user/user.service";

@Component({
  selector: 'app-create-assignment',
  templateUrl: './create-assignment.component.html',
  styleUrls: ['./create-assignment.component.scss'],
})
export class CreateAssignmentComponent implements OnInit, OnDestroy {
  @ViewChild('successModal', {static: true}) successModal;

  collapse = {
    solution: false,
    templateSolution: false,
  };

  title = '';
  loggedIn = false;
  author = '';
  email = '';
  deadlineDate: string | null;
  deadlineTime: string | null;
  description = '';
  solution = '';
  templateSolution = '';

  tasks: Task[] = [];

  checking = false;
  results?: TaskResult[];
  markers: Marker[] = [];

  submitting = false;
  id?: string;
  token?: string;

  private readonly origin: string;

  constructor(
    private assignmentService: AssignmentService,
    private modalService: NgbModal,
    private dragulaService: DragulaService,
    private users: UserService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit(): void {
    this.dragulaService.createGroup('TASKS', {
      moves(el, container, handle): boolean {
        return handle?.classList.contains('handle') ?? false;
      },
    });

    const draft = this.assignmentService.draft;
    if (draft) {
      this.setAssignment(draft);
    }

    // TODO unsubscribe
    this.users.current$.subscribe(user => {
      if (!user) {
        return;
      }

      this.loggedIn = true;
      if (user.firstName && user.lastName) {
        this.author = `${user.firstName} ${user.lastName}`;
      }
      if (user.email) {
        this.email = user.email;
      }
    });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy('TASKS');
  }

  getDeadline(): Date | null {
    return this.deadlineDate ? new Date(this.deadlineDate + ' ' + (this.deadlineTime ?? '00:00')) : null;
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
      deadline: this.getDeadline(),
      solution: this.solution,
      templateSolution: this.templateSolution,
      tasks: this.tasks.filter(t => !t.deleted),
    } as Assignment;
  }

  setAssignment(a: Assignment): void {
    this.title = a.title;
    this.description = a.description;
    this.author = a.author;
    this.email = a.email;
    const deadline = a.deadline;
    if (deadline) {
      const year = deadline.getFullYear();
      const month = String(deadline.getMonth() + 1).padStart(2, '0');
      const day = String(deadline.getDate()).padStart(2, '0');
      this.deadlineDate = `${year}-${month}-${day}`;

      const hour = String(deadline.getHours()).padStart(2, '0');
      const minute = String(deadline.getMinutes()).padStart(2, '0');
      const second = String(deadline.getSeconds()).padStart(2, '0');
      this.deadlineTime = `${hour}:${minute}:${second}`;
    } else {
      this.deadlineDate = null;
      this.deadlineTime = null;
    }
    this.tasks = a.tasks.map(t => ({...t})); // deep copy
    this.solution = a.solution;
    this.templateSolution = a.templateSolution;

    this.collapse.solution = !a.solution;
    this.collapse.templateSolution = !a.templateSolution;
  }

  check(): void {
    this.saveDraft();
    this.checking = true;
    this.assignmentService.check({solution: this.solution, tasks: this.tasks}).subscribe(response => {
      this.checking = false;
      this.results = response.results;
      this.markers = this.assignmentService.lint(response);
    });
  }

  saveDraft(): void {
    this.assignmentService.draft = this.getAssignment();
  }

  onImport(file: File): void {
    this.assignmentService.upload(file).subscribe(result => {
      this.setAssignment(result);
      this.saveDraft();
      this.results = undefined;
      this.markers = [];
    });
  }

  onExport(): void {
    const assignment = this.getAssignment();
    this.assignmentService.download(assignment);
  }

  addTask(): void {
    this.tasks.push({description: '', points: 0, verification: '', collapsed: false, deleted: false});
    if (this.results) {
      this.results.push({output: '', points: 0});
    }
    this.saveDraft();
  }

  removeTask(id: number): void {
    this.tasks[id].deleted = true;
    this.saveDraft();
  }

  restoreTask(id: number): void {
    this.tasks[id].deleted = false;
    this.saveDraft();
  }

  submit(): void {
    this.submitting = true;
    this.assignmentService.submit(this.getAssignment()).subscribe(result => {
      this.submitting = false;
      this.id = result.id;
      this.token = result.token;
      this.modalService.open(this.successModal, {ariaLabelledBy: 'successModalLabel', size: 'xl'});
    });
  }

  getColorClass(taskID: number): string {
    if (!this.results) {
      return '';
    }
    const result = this.results[taskID];
    if (!result) {
      return '';
    }

    const points = result.points;
    return points === 0 ? 'danger' : 'success';
  }

  getSolveLink(origin: boolean): string {
    return `${origin ? this.origin : ''}/assignments/${this.id}`;
  }

  getSolutionsLink(origin: boolean): string {
    return `${origin ? this.origin : ''}/assignments/${this.id}/solutions`;
  }
}
