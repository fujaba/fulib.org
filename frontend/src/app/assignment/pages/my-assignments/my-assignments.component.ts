import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, switchMap, tap} from 'rxjs/operators';
import {ReadAssignmentDto} from '../../model/assignment';
import {AssignmentService} from '../../services/assignment.service';

@Component({
  selector: 'app-my-assignments',
  templateUrl: './my-assignments.component.html',
  styleUrls: ['./my-assignments.component.scss'],
  standalone: false,
})
export class MyAssignmentsComponent implements OnInit {
  assignments?: ReadAssignmentDto[];
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
      switchMap(archived => this.assignmentService.findOwn(archived)),
    ).subscribe(assignments => this.assignments = assignments);
  }

  remove(assignment: ReadAssignmentDto) {
    this.assignments = this.assignments?.filter(a => a._id !== assignment._id);
  }
}
