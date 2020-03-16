import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DragulaService} from 'ng2-dragula';

import Task from '../model/task';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import TaskResult from '../model/task-result';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('solutionInput', {static: true}) solutionInput;
  @ViewChild('templateSolutionInput', {static: true}) templateSolutionInput;
  @ViewChild('successModal', {static: true}) successModal;

  importFile: File = null;

  collapse = {
    solution: false,
    templateSolution: false,
  };

  title = '';
  author = '';
  email = '';
  deadlineDate: Date;
  deadlineTime: Date;
  description = '';
  solution = '';
  templateSolution = '';

  tasks: (Task & {collapsed: boolean})[] = [];

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
    if (this.deadlineDate && this.deadlineTime) {
      return new Date(this.deadlineDate.toDateString() + ' ' + this.deadlineTime.toTimeString());
    } else if (this.deadlineDate) {
      return this.deadlineDate;
    } else {
      return null;
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
      deadline: this.getDeadline(),
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
    this.tasks = a.tasks.map(t => ({...t, collapsed: !!t['collapsed']}));
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
    this.assignmentService.draft = this.getAssignment();
  }

  onImport(): void {
    this.assignmentService.upload(this.importFile).subscribe(result => {
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
    this.tasks.push({description: '', points: undefined, verification: '', collapsed: false});
    if (this.results) {
      this.results.push(undefined);
    }
    this.saveDraft();
  }

  removeTask(id: number): void {
    this.tasks.splice(id, 1);
    if (this.results) {
      this.results.splice(id, 1);
    }
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
