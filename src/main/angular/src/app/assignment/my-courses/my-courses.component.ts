import {Component, OnInit} from '@angular/core';
import {CourseService} from '../course.service';
import Assignment from '../model/assignment';
import Course from '../model/course';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss'],
})
export class MyCoursesComponent implements OnInit {
  courses: Course[] = [];

  constructor(
    private courseService: CourseService,
  ) {
  }

  ngOnInit(): void {
    this.courseService.getOwn().subscribe(assignments => {
      this.courses = assignments.sort(Assignment.comparator);
    });
  }
}
