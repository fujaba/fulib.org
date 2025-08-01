import {Component, DOCUMENT, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import Course from '../../../model/course';
import {CourseService} from '../../../services/course.service';

@Component({
  selector: 'app-assignment-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  standalone: false,
})
export class ShareComponent implements OnInit {
  course?: Course;

  readonly origin: string;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit() {
    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.get(cid)),
    ).subscribe(course => this.course = course);
  }
}
