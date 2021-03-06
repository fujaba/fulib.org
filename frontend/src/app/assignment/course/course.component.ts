import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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

  latestSolutionIDs?: string[];

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
    ).subscribe(course => {
      this.course = course;

      const assignmentIds = course.assignmentIds!;
      if (!this.assignmentID) {
        const firstAssignment = assignmentIds[0];
        this.router.navigate(['assignments', 'courses', course.id, 'assignments', firstAssignment]);
        return;
      }

      const solutions = this.solutionService.getOwnIds();
      this.latestSolutionIDs = new Array<string>(assignmentIds.length);

      course.assignments = new Array<Assignment>(assignmentIds.length);
      for (let i = 0; i < assignmentIds.length; i++) {
        const id = assignmentIds[i];
        this.assignmentService.get(id).subscribe(assignment => {
          course.assignments![i] = assignment;
        });

        const lastSolutionID = solutions.find(({assignment}) => id === assignment);
        if (lastSolutionID) {
          this.latestSolutionIDs[i] = lastSolutionID.id;
        }
      }
    });
  }

  getBadgeColor(index: number, assignment: Assignment) {
    if (!assignment) {
      return 'secondary';
    }
    if (assignment.id === this.assignmentID) {
      return 'primary';
    }
    if (this.latestSolutionIDs && this.latestSolutionIDs[index]) {
      return 'success';
    }
    return 'secondary';
  }
}
