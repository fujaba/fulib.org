import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {CourseService} from 'src/app/assignment/services/course.service';
import Course, {CourseStudent} from '../../../model/course';
import {authorInfoProperties} from '../../../model/solution';
import {AssignmentService} from "../../../services/assignment.service";

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent implements OnInit {
  course?: Course;
  students: CourseStudent[] = [];
  assignmentNames: string[] = [];
  assignees: string[] = [];

  readonly authorProperties = authorInfoProperties;

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
      switchMap(course => this.assignmentService.findAll(course.assignments)),
    ).subscribe(assignments => {
      if (!assignments.length) {
        return;
      }
      const firstTitle = assignments[0].title;
      if (assignments.length === 1) {
        this.assignmentNames = [firstTitle];
        return;
      }
      let prefixLength = 0;
      while (prefixLength < firstTitle.length && assignments.every(a => a.title[prefixLength] === firstTitle[prefixLength])) {
        prefixLength++;
      }
      this.assignmentNames = assignments.map(a => a.title.slice(prefixLength));
    });

    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.getStudents(cid)),
    ).subscribe(students => {
      this.students = students;
      this.assignees = [...new Set(students.flatMap(s => s.solutions.map(s => s?.assignee).filter(x => x)))].sort();
    });
  }
}
