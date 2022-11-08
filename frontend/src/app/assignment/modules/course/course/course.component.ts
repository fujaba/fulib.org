import {Component, OnInit} from '@angular/core';
import {courseChildren} from '../course-routing.module';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
})
export class CourseComponent implements OnInit {
  routes = courseChildren;

  constructor() {
  }

  ngOnInit(): void {
  }

}
