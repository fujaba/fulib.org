import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

import {Marker} from '../../../shared/model/marker';
import Assignment from '../../model/assignment';
import {Evaluation} from '../../model/evaluation';
import Solution from '../../model/solution';
import {AssignmentService} from '../../services/assignment.service';
import {SolutionService} from '../../services/solution.service';
import {TaskService} from '../../services/task.service';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;
  markers: Marker[] = [];

  points?: Record<string, number>;
  evaluations?: Record<string, Evaluation>;

  origin: string;

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private taskService: TaskService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([{aid, sid}, {atok, stok}]) => {
      aid && atok && this.assignmentService.setToken(aid, atok);
      aid && sid && stok && this.solutionService.setToken(aid, sid, stok);
    });

    this.route.params.pipe(
      switchMap(({aid: assignmentId, sid: solutionId}) => forkJoin([
        this.assignmentService.get(assignmentId).pipe(tap(assignment => this.assignment = assignment)),
        this.solutionService.get(assignmentId, solutionId).pipe(tap(solution => {
          this.solution = solution;
        })),
        this.solutionService.getEvaluations(assignmentId, solutionId).pipe(tap(evaluations => {
          this.evaluations = {};
          for (const evaluation of evaluations) {
            this.evaluations[evaluation.task] = evaluation;
          }
        })),
      ])),
    ).subscribe(([assignment, , evaluations]) => {
      this.points = this.taskService.createPointsCache(assignment.tasks, this.evaluations!);
      // NB: this happens here instead of where the solution is loaded above, because the solution text needs to be updated first.
      // Otherwise the markers don't show up
      this.markers = this.assignmentService.lint({results: evaluations});
    }, error => {
      if (error.status === 401 || error.status === 403) {
        this.router.navigate(['token'], {relativeTo: this.route});
      }
    });
  }
}
