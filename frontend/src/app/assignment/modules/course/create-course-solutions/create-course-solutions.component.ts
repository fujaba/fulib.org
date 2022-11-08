import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EMPTY, forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import Course from '../../../model/course';
import {AssignmentService} from '../../../services/assignment.service';
import {CourseService} from '../../../services/course.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-create-course-solutions',
  templateUrl: './create-course-solutions.component.html',
  styleUrls: ['./create-course-solutions.component.scss'],
})
export class CreateCourseSolutionsComponent implements OnInit {
  course?: Course;
  assignments?: Record<string, Assignment>;

  latestSolutionIDs?: Record<string, string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
    private courseService: CourseService,
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.get(cid)),
      switchMap(course => {
        this.course = course;
        if (!this.route.firstChild?.snapshot.params.aid) {
          const firstAssignment = course.assignments[0];
          this.router.navigate(['assignments', firstAssignment], {relativeTo: this.route});
          return EMPTY;
        }

        const solutions = this.solutionService.getOwnIds();
        this.latestSolutionIDs = {};
        for (const {assignment, id: solution} of solutions) {
          if (course.assignments.includes(assignment)) {
            this.latestSolutionIDs[assignment] = solution;
          }
        }
        this.assignments = {};
        return forkJoin(course.assignments.map(id => this.assignmentService.get(id).pipe(tap(a => this.assignments![id] = a))));
      }),
    ).subscribe();
  }

  getBadgeColor(assignment: string) {
    if (!assignment) {
      return 'secondary';
    }
    if (this.latestSolutionIDs && this.latestSolutionIDs[assignment]) {
      return 'success';
    }
    return 'secondary';
  }
}
