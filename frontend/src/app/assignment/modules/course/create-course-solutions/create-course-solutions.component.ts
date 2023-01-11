import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {ReadAssignmentDto} from '../../../model/assignment';
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
  assignments: ReadAssignmentDto[] = [];
  solutions: (string | undefined)[] = [];

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
          this.router.navigate([firstAssignment], {relativeTo: this.route});
        }

        const solutions = this.solutionService.getOwnIds();
        this.solutions = Array(course.assignments.length).fill(undefined);
        for (const {assignment, id: solution} of solutions) {
          const index = course.assignments.indexOf(assignment);
          if (index >= 0) {
            this.solutions[index] = solution;
          }
        }
        return this.assignmentService.findAll(course.assignments);
      }),
    ).subscribe(assignments => {
      this.assignments = assignments;
    });
  }
}
