import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, switchMap, tap} from 'rxjs/operators';
import Assignment from '../../model/assignment';
import {AssignmentService} from '../../services/assignment.service';

@Component({
  selector: 'app-my-assignments',
  templateUrl: './my-assignments.component.html',
  styleUrls: ['./my-assignments.component.scss'],
})
export class MyAssignmentsComponent implements OnInit {
  assignments?: Assignment[];
  archived = false;

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      map(({archived}) => archived === 'true'),
      tap(archived => this.archived = archived),
      switchMap(archived => this.assignmentService.getOwn(archived)),
    ).subscribe(assignments => this.assignments = assignments);
  }
}
