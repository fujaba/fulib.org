import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {CourseService} from 'src/app/assignment/services/course.service';
import Course, {CourseStudent} from '../../../model/course';
import {authorInfoProperties} from '../../../model/solution';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
})
export class StudentsComponent implements OnInit {
  course?: Course;
  students: CourseStudent[] = [];

  readonly authorProperties = authorInfoProperties;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.get(cid)),
    ).subscribe(course => this.course = course);

    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.getStudents(cid)),
    ).subscribe(students => this.students = students);
  }
}
