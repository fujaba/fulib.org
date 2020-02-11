import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';

@Component({
  selector: 'app-solve',
  templateUrl: './solve.component.html',
  styleUrls: ['./solve.component.scss']
})
export class SolveComponent implements OnInit {
  assignment: Assignment;
  solution: string;
  name: string;
  studentID: string;
  email: string;

  submitting: boolean;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.assignmentService.get(id).subscribe(result => {
        this.assignment = result;
      });
    });
  }

  submit() {
    this.submitting = true;
  }
}
