import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {CourseService} from 'src/app/assignment/services/course.service';
import Course, {CourseAssignee} from '../../../model/course';
import {AssignmentService} from "../../../services/assignment.service";
import {ReadAssignmentDto} from "../../../model/assignment";

@Component({
  selector: 'app-assignees',
  templateUrl: './assignees.component.html',
  styleUrls: ['./assignees.component.scss'],
  standalone: false,
})
export class AssigneesComponent implements OnInit {
  course?: Course;
  assignees?: CourseAssignee[];
  assignments: (ReadAssignmentDto | undefined)[] = [];
  assignmentNames: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.get(cid)),
      tap(course => this.course = course),
      switchMap(course => this.assignmentService.findIds(course.assignments)),
    ).subscribe(assignments => {
      this.assignments = assignments;
      this.assignmentNames = this.courseService.getAssignmentNames(assignments);
    });

    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.getAssignees(cid)),
    ).subscribe(assignees => {
      this.assignees = assignees;
    });
  }
}
