import {Component, OnInit} from '@angular/core';
import {AssignmentService} from '../assignment.service';
import Assignment from '../model/assignment';

@Component({
  selector: 'app-my-assignments',
  templateUrl: './my-assignments.component.html',
  styleUrls: ['./my-assignments.component.scss']
})
export class MyAssignmentsComponent implements OnInit {
  assignments?: Assignment[];

  constructor(
    private assignmentService: AssignmentService,
  ) {
  }

  ngOnInit() {
    this.assignments = [];
    this.assignmentService.getOwn().subscribe(next => {
      this.assignments.push(next);
      // TODO this can cause problems with lots of assignments.
      //      either they need to be sorted once after the last one is added,
      //      or a sorted set should be used
      this.assignments.sort(Assignment.comparator);
    });
  }
}
