import {Component, OnInit} from '@angular/core';
import Course from '../../../model/course';
import {CourseService} from '../../../services/course.service';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss'],
  standalone: false,
})
export class MyCoursesComponent implements OnInit {
  courses?: Course[];

  constructor(
    private courseService: CourseService,
  ) {
  }

  ngOnInit(): void {
    this.courseService.getOwn().subscribe(courses => {
      this.courses = courses;
    });
  }
}
