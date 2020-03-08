import {Component, OnInit} from '@angular/core';
import {AssignmentService} from '../assignment.service';
import Assignment from '../model/assignment';

@Component({
  selector: 'app-assignment-list',
  templateUrl: './assignment-list.component.html',
  styleUrls: ['./assignment-list.component.scss']
})
export class AssignmentListComponent implements OnInit {
  assignments?: Assignment[];

  constructor(
    private assignmentService: AssignmentService,
  ) {
  }

  ngOnInit() {
    this.assignments = [];
    this.assignmentService.getOwn().subscribe(next => {
      this.assignments.push(next);
    });
  }
}
