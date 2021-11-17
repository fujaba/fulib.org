import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-solution-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class SolutionDetailsComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => forkJoin([
        this.assignmentService.get(aid),
        this.solutionService.get(aid, sid)
      ])),
    ).subscribe(([assignment, solution]) => {
      this.assignment = assignment;
      this.solution = solution;
    });
  }

}
