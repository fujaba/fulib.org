import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {forkJoin, of, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {Marker} from '../../shared/model/marker';
import {ScenarioEditorService} from '../../scenario-editor.service';
import {UserService} from '../../user/user.service';
import {AssignmentService} from '../assignment.service';
import {CourseService} from '../course.service';
import Assignment from '../model/assignment';
import Course from '../model/course';
import Solution from '../model/solution';
import TaskResult from '../model/task-result';
import {SolutionService} from '../solution.service';

@Component({
  selector: 'app-create-solution',
  templateUrl: './create-solution.component.html',
  styleUrls: ['./create-solution.component.scss'],
})
export class CreateSolutionComponent implements OnInit, OnDestroy {
  @ViewChild('successModal', {static: true}) successModal;

  course?: Course;
  assignment: Assignment;
  solution: string;
  loggedIn = false;
  name: string;
  studentID: string;
  email: string;

  checking = false;
  results?: TaskResult[];
  markers: Marker[] = [];

  id?: string;
  token?: string;
  timeStamp?: Date;

  submitting: boolean;

  private readonly origin: string;

  nextAssignment?: Assignment;

  private userSubscription: Subscription;

  constructor(
    private scenarioEditorService: ScenarioEditorService,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private users: UserService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => forkJoin({
        assignment: this.assignmentService.get(params.aid).pipe(tap(assignment => {
          this.assignment = assignment;
          this.loadDraft();
        })),
        course: params.cid ? this.courseService.get(params.cid).pipe(tap(course => this.course = course)) : of(undefined),
      })),
      switchMap(({assignment, course}) => assignment && course ? this.assignmentService.getNext(course, assignment) : of(undefined)),
    ).subscribe(next => {
      this.nextAssignment = next;
    });

    this.userSubscription = this.users.current$.subscribe(user => {
      if (!user) {
        return;
      }

      this.loggedIn = true;
      if (user.firstName && user.lastName) {
        this.name = `${user.firstName} ${user.lastName}`;
      }
      if (user.email) {
        this.email = user.email;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  getSolution(): Solution {
    return {
      assignment: this.assignment.id!,
      id: this.id,
      token: this.token,
      name: this.name,
      studentID: this.studentID,
      email: this.email,
      solution: this.solution,
      timeStamp: this.timeStamp,
      results: this.results,
    };
  }

  setSolution(result: Solution): void {
    this.id = result.id;
    this.token = result.token;
    this.name = result.name;
    this.studentID = result.studentID;
    this.email = result.email;
    this.solution = result.solution;
    this.timeStamp = result.timeStamp;
    this.results = result.results;
  }

  loadDraft(): void {
    this.name = this.solutionService.name ?? '';
    this.studentID = this.solutionService.studentID ?? '';
    this.email = this.solutionService.email ?? '';
    this.solution = this.solutionService.getDraft(this.assignment) ?? this.assignment.templateSolution;
  }

  saveDraft(): void {
    this.solutionService.name = this.name;
    this.solutionService.studentID = this.studentID;
    this.solutionService.email = this.email;
    this.solutionService.setDraft(this.assignment, this.solution);
  }

  check(): void {
    this.saveDraft();
    this.checking = true;

    this.solutionService.check({assignment: this.assignment, solution: this.solution}).subscribe(result => {
      this.checking = false;
      this.results = result.results;
      this.markers = this.assignmentService.lint(result);
    });
  }

  submit(): void {
    this.submitting = true;
    this.solutionService.submit(this.getSolution()).subscribe(result => {
      this.setSolution(result);
      this.modalService.open(this.successModal, {ariaLabelledBy: 'successModalLabel', size: 'xl'});
      this.submitting = false;
    });
  }

  getLink(origin: boolean): string {
    return `${origin ? this.origin : ''}/assignments/${this.assignment.id}/solutions/${this.id}`;
  }
}
