import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {combineLatest} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import Assignment, {ReadAssignmentDto} from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {solutionChildRoutes} from '../solution-routing.module';


@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
  standalone: false,
})
export class SolutionComponent implements OnInit {
  assignment?: Assignment | ReadAssignmentDto;
  solution?: Solution;

  routes = solutionChildRoutes;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([{aid, sid}, {atok, stok}]) => {
      aid && atok && this.assignmentService.setToken(aid, atok);
      aid && sid && stok && this.solutionService.setToken(aid, sid, stok);
    });

    this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => this.assignment = assignment);

    this.route.params.pipe(
      switchMap(({aid, sid}) => this.solutionService.get(aid, sid)),
    ).subscribe(solution => this.solution = solution);
  }
}
