import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DragulaService} from 'ng2-dragula';

import Task from '../model/task';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import TaskResult from '../model/task-result';
import {KeycloakService} from "keycloak-angular";

@Component({
  selector: 'app-create-assignment',
  templateUrl: './create-assignment.component.html',
  styleUrls: ['./create-assignment.component.scss']
})
export class CreateAssignmentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('solutionInput', {static: true}) solutionInput;
  @ViewChild('templateSolutionInput', {static: true}) templateSolutionInput;
  @ViewChild('successModal', {static: true}) successModal;

  collapse = {
    solution: false,
    templateSolution: false,
  };

  title = '';
  loggedIn = false;
  author = '';
  email = '';
  deadlineDate: string;
  deadlineTime: string;
  description = '';
  solution = '';
  templateSolution = '';

  tasks: (Task & {collapsed: boolean, deleted: boolean})[] = [];

  checking = false;
  results?: TaskResult[];

  submitting = false;
  id?: string;
  token?: string;

  private readonly origin: string;

  constructor(
    private assignmentService: AssignmentService,
    private modalService: NgbModal,
    private dragulaService: DragulaService,
    private keycloak: KeycloakService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit(): void {
    this.dragulaService.createGroup('TASKS', {
      moves(el, container, handle) {
        return handle.classList.contains('handle');
      }
    });

    const draft = this.assignmentService.draft;
    if (draft) {
      this.setAssignment(draft);
    }

    this.keycloak.isLoggedIn().then(loggedIn => {
      if (!loggedIn) {
        return;
      }

      this.keycloak.loadUserProfile().then(profile => {
        this.loggedIn = true;
        this.author = `${profile.firstName} ${profile.lastName}`;
        this.email = profile.email;
      });
    });
  }

  ngOnDestroy(): void {
    this.dragulaService.destroy('TASKS');

    this.solutionInput.contentChange.unsubscribe();
    this.templateSolutionInput.contentChange.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.solutionInput.contentChange.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.check();
    });

    this.templateSolutionInput.contentChange.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.saveDraft();
    });
  }

  getDeadline(): Date | null {
    return this.deadlineDate ? new Date(this.deadlineDate + ' ' + (this.deadlineTime || '00:00')) : null;
  }

  getAssignment(keepDeleted: boolean = false): Assignment {
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
      tasks: keepDeleted ? this.tasks : this.tasks.filter(t => !t.deleted),
    } as Assignment;
  }

  setAssignment(a: Assignment): void {
    this.title = a.title;
    this.description = a.description;
    this.author = a.author;
    this.email = a.email;
    let deadline = a.deadline;
    if (deadline) {
      this.deadlineDate = `${deadline.getFullYear()}-${String(deadline.getMonth() + 1).padStart(2, '0')}-${String(deadline.getDate()).padStart(2, '0')}`;
      this.deadlineTime = `${String(deadline.getHours()).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}:${String(deadline.getSeconds()).padStart(2, '0')}`;
    }
    else {
      this.deadlineDate = null;
      this.deadlineTime = null;
    }
    this.tasks = a.tasks.map(t => ({...t, collapsed: !!t['collapsed'], deleted: !!t['deleted']}));
    this.solution = a.solution;
    this.templateSolution = a.templateSolution;

    this.collapse.solution = !a.solution;
    this.collapse.templateSolution = !a.templateSolution;
  }

  check(): void {
    this.checking = true;
    this.assignmentService.check({solution: this.solution, tasks: this.tasks}).subscribe(response => {
      this.checking = false;
      this.results = response.results;
    })
  }

  saveDraft(): void {
    this.assignmentService.draft = this.getAssignment(true);
  }

  onImport(file: File): void {
    this.assignmentService.upload(file).subscribe(result => {
      this.setAssignment(result);
      this.saveDraft();
      this.results = undefined;
    });
  }

  onExport(): void {
    const assignment = this.getAssignment();
    this.assignmentService.download(assignment);
  }

  addTask(): void {
    this.tasks.push({description: '', points: undefined, verification: '', collapsed: false, deleted: false});
    if (this.results) {
      this.results.push(undefined);
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
