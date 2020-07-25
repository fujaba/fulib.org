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

  ngOnInit(): void {
    this.assignmentService.getOwn().subscribe(assignments => {
      this.assignments = assignments.sort(Assignment.comparator);
    });
  }
}
