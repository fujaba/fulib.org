import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-submit-modal',
  templateUrl: './submit-modal.component.html',
  styleUrls: ['./submit-modal.component.scss'],
})
export class SubmitModalComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;
  draftLink?: string;

  constructor(
    public route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => forkJoin([
        this.assignmentService.get(aid),
        this.solutionService.get(aid, sid),
        this.solutionService.getEvaluations(aid, sid),
      ])),
    ).subscribe(([assignment, solution, evaluations]) => {
      this.assignment = assignment;
      this.solution = solution;

      const org = assignment.classroom?.org;
      const prefix = assignment.classroom?.prefix;
      const githubUsername = solution.author?.github;
      const title = assignment.title;
      const body = 'test';
      this.draftLink = `https://github.com/${org}/${prefix}-${githubUsername}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    });
  }

  create() {

  }
}
