import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {forkJoin, of, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {Marker} from '../../../shared/model/marker';
import {UserService} from '../../../user/user.service';
import Assignment from '../../model/assignment';
import Course from '../../model/course';
import Solution, {AuthorInfo} from '../../model/solution';
import {AssignmentService} from '../../services/assignment.service';
import {CourseService} from '../../services/course.service';
import {SolutionService} from '../../services/solution.service';

@Component({
  selector: 'app-create-solution',
  templateUrl: './create-solution.component.html',
  styleUrls: ['./create-solution.component.scss'],
})
export class CreateSolutionComponent implements OnInit, OnDestroy {
  course?: Course;
  assignment: Assignment;
  solution: string;
  loggedIn = false;
  author: AuthorInfo;

  status = 'Your solution is checked automatically when you make changes.';
  markers: Marker[] = [];

  submitting: boolean;

  nextAssignment?: Assignment;

  private userSubscription: Subscription;

  constructor(
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private router: Router,
    private route: ActivatedRoute,
    private users: UserService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.author = this.solutionService.getAuthor() ?? {
      name: '',
      studentId: '',
      email: '',
      github: '',
    };

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
        this.author.name = `${user.firstName} ${user.lastName}`;
      }
      if (user.email) {
        this.author.email = user.email;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  getSolution(): Solution {
    return {
      assignment: this.assignment._id,
      author: this.author,
      solution: this.solution,
    };
  }

  loadDraft(): void {
    this.solution = this.solutionService.getDraft(this.assignment) ?? this.assignment.templateSolution;
  }

  saveDraft(): void {
    this.solutionService.setAuthor(this.author);
    this.solutionService.setDraft(this.assignment, this.solution);
  }

  check(): void {
    this.saveDraft();
    this.status = 'Checking...';
    this.solutionService.check({assignment: this.assignment, solution: this.solution}).subscribe(response => {
      this.status = 'Your solution was checked automatically. Don\'t forget to submit when you are done!';
      this.markers = this.assignmentService.lint(response);
    }, error => {
      this.status = 'Failed to check your solution automatically: ' + error.error?.message ?? error.message;
    });
  }

  submit(): void {
    this.submitting = true;
    this.solutionService.submit(this.getSolution()).subscribe(result => {
      this.submitting = false;
      this.toastService.success('Solution', 'Successfully submitted solution');
      if (this.course && this.nextAssignment) {
        this.router.navigate(['/assignments', 'courses', this.course._id, 'assignments', this.nextAssignment._id]);
      } else {
        this.router.navigate(['/assignments', result.assignment, 'solutions', result._id, 'share']);
      }
    }, error => {
      this.toastService.error('Solution', 'Failed to submit solution', error);
      this.submitting = false;
    });
  }
}
