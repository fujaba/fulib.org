import { Component, OnInit, Input } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import Course from '../model/course';
import {CourseService} from '../course.service';
import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  courseID?: string;
  course?: Course;

  assignmentID?: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
    private courseService: CourseService,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.assignmentID = params.aid;

      this.courseID = params.cid;
      this.courseService.get(this.courseID).subscribe(course => {
        this.course = course;

        const assignmentIds = course.assignmentIds;
        if (!this.assignmentID) {
          const firstAssignment = assignmentIds[0];
          this.router.navigate(['assignments', 'courses', this.courseID, 'assignments', firstAssignment]);
        }

        course.assignments = new Array<Assignment>(assignmentIds.length);
        for (let i = 0; i < assignmentIds.length; i++) {
          const id = assignmentIds[i];
          this.assignmentService.get(id).subscribe(assignment => {
            course.assignments[i] = assignment;
          });
        }
      });
    })
  }
}
