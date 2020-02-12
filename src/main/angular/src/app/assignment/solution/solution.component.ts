import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';

import Assignment from '../model/assignment';
import Solution from '../model/solution';
import Comment from '../model/comment';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;

  comments?: Comment[] = [
    {
      parent: null,
      author: 'Testus',
      email: 'test@example.org',
      markdown: '*Hello World*',
      html: '<b>Hello World</b>',
      timeStamp: new Date(),
    },
    {
      parent: null,
      author: 'The Corrector',
      email: 'correct@uni-kassel.de',
      markdown: '`0P` very bad',
      html: '<code>0P</code> very bad',
      timeStamp: new Date(),
    },
  ];

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
