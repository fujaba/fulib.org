import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs';
import Course from '../../../model/course';
import {CourseService} from '../../../services/course.service';
import {courseChildren} from '../course-routing.module';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
  standalone: false,
})
export class CourseComponent implements OnInit {
  course?: Course;

  readonly routes = courseChildren;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.get(cid)),
    ).subscribe(course => this.course = course);
  }

}
