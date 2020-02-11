import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';
import TaskResult from '../model/task-result';

@Component({
  selector: 'app-solve',
  templateUrl: './solve.component.html',
  styleUrls: ['./solve.component.scss']
})
export class SolveComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('successModal', {static: true}) successModal;
  @ViewChild('solutionInput', {static: true}) solutionInput;

  assignment: Assignment;
  solution: string;
  name: string;
  studentID: string;
  email: string;

  checking = false;
  results?: TaskResult[];

  // TODO does not work with Angular Universal
  baseURL = window.location.origin;
  id: string;
  token: string;
  timeStamp: Date;

  submitting: boolean;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.assignmentService.get(params.id).subscribe(result => {
        this.assignment = result;
      });
    });
  }

  ngAfterViewInit() {
    this.solutionInput.contentChange.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.check();
    });
  }

  ngOnDestroy() {
    this.solutionInput.contentChange.unsubscribe();
  }

  check() {
    this.checking = true;

    this.solutionService.check({assignment: this.assignment, solution: this.solution}).subscribe(result => {
      this.checking = false;
      this.results = result.results;
    });
  }

  submit() {
    this.submitting = true;

    const solution: Solution = {
      assignment: this.assignment,
      name: this.name,
      studentID: this.studentID,
      email: this.email,
      solution: this.solution,
    };

    this.solutionService.submit(solution).subscribe(result => {
      this.id = result.id;
      this.token = result.token;
      this.timeStamp = result.timeStamp;
      this.results = result.results;

      this.modalService.open(this.successModal, {ariaLabelledBy: 'successModalLabel', size: 'xl'});
      this.submitting = false;
    })
  }
}
