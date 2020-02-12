import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';

@Component({
  selector: 'app-solution-list',
  templateUrl: './solution-list.component.html',
  styleUrls: ['./solution-list.component.scss']
})
export class SolutionListComponent implements OnInit {
  assignmentID: string;
  assignment?: Assignment;

  constructor(
    private activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.assignmentID = params.id;
      this.assignmentService.get(this.assignmentID).subscribe(assignment => {
        this.assignment = assignment;
      });
    });
  }
}
