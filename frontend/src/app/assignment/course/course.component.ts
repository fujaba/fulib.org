import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EMPTY, forkJoin} from 'rxjs';
import Course from '../model/course';
import {CourseService} from '../course.service';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import {SolutionService} from '../solution.service';
import {switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
})
export class CourseComponent implements OnInit {
  courseID?: string;
  course?: Course;
  assignments?: (Assignment | undefined)[];

  latestSolutionIDs?: (string | undefined)[];

  assignmentID?: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
    private courseService: CourseService,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params.pipe(
      tap(params => {
        this.assignmentID = params.aid;
        this.courseID = params.cid;
      }),
      switchMap(params => this.courseService.get(params.cid)),
      switchMap(course => {
        this.course = course;
        if (!this.assignmentID) {
          const firstAssignment = course.assignments[0];
          this.router.navigate(['assignments', 'courses', course._id, 'assignments', firstAssignment], {skipLocationChange: true});
          return EMPTY;
        }

        const solutions = this.solutionService.getOwnIds();
        this.latestSolutionIDs = course.assignments.map(a => solutions.find(({assignment}) => a === assignment)?.id);
        this.assignments = course.assignments.map(() => undefined);
        return forkJoin(course.assignments.map((id, index) => this.assignmentService.get(id).pipe(tap(a => this.assignments![index] = a))));
      }),
    ).subscribe();
  }

  getBadgeColor(index: number, assignment: string) {
    if (!assignment) {
      return 'secondary';
    }
    if (assignment === this.assignmentID) {
      return 'primary';
    }
    if (this.latestSolutionIDs && this.latestSolutionIDs[index]) {
      return 'success';
    }
    return 'secondary';
  }
}
