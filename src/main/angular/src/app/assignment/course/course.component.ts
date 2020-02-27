import { Component, OnInit, Input } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import Course from '../model/course';
import {CourseService} from '../course.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  courseID?: string;
  course?: Course;

  constructor(
    private activatedRoute: ActivatedRoute,
    private courseService: CourseService,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.courseID = params.cid;
      this.courseService.get(this.courseID).subscribe(course => {
        this.course = course;
      });
    })
  }
}
