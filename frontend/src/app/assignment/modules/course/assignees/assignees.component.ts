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
    // TODO duplicated from students.component.ts
    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.get(cid)),
      tap(course => this.course = course),
      switchMap(course => this.assignmentService.findIds(course.assignments)),
    ).subscribe(assignments => {
      this.assignments = assignments;
      if (!assignments.length) {
        return;
      }
      const firstTitle = assignments.find(a => a?.title)?.title ?? '';
      if (assignments.length === 1) {
        this.assignmentNames = [firstTitle];
        return;
      }
      let prefixLength = 0;
      while (prefixLength < firstTitle.length && assignments.every(a => !a || a.title[prefixLength] === firstTitle[prefixLength])) {
        prefixLength++;
      }
      this.assignmentNames = assignments.map(a => a ? a.title.slice(prefixLength) : '<deleted>');
    });

    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.getAssignees(cid)),
    ).subscribe(assignees => {
      this.assignees = assignees;
    });
  }
}
