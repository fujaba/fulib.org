import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';

@Component({
  selector: 'app-solve',
  templateUrl: './solve.component.html',
  styleUrls: ['./solve.component.scss']
})
export class SolveComponent implements OnInit {
  @ViewChild('successModal', {static: true}) successModal;

  assignment: Assignment;
  solution: string;
  name: string;
  studentID: string;
  email: string;

  // TODO does not work with Angular Universal
  baseURL = window.location.origin;
  id: string;
  token: string;
  timeStamp: Date;

  submitting: boolean;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
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

    const solution: Solution = {
      assignment: this.assignment,
      name: this.name,
      studentID: this.studentID,
      email: this.email,
      solution: this.solution,
    };

    this.solutionService.submit(solution).subscribe(result => {
      this.id = result.id;
      this.token = result.token;
      this.timeStamp = result.timeStamp;

      this.modalService.open(this.successModal, {ariaLabelledBy: 'successModalLabel', size: 'xl'});
      this.submitting = false;
    })
  }
}
