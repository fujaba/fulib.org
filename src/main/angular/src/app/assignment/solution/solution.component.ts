import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';

import Assignment from '../model/assignment';
import Solution from '../model/solution';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const assignmentID = params.aid;
      const solutionID = params.sid;
      this.assignmentService.get(assignmentID).subscribe(assignment => {
        this.assignment = assignment;
      });
      this.solutionService.get(assignmentID, solutionID).subscribe(solution => {
        this.solution = solution;
      })
    })
  }
}
