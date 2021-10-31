import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, forkJoin} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private taskService: TaskService,
  ) {
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      map(([params, query]) => {
        const assignmentId = params.aid;
        if (query.atok) {
          this.assignmentService.setToken(assignmentId, query.atok);
        }
        const solutionId = params.sid;
        if (query.stok) {
          this.solutionService.setToken(assignmentId, solutionId, query.stok);
        }
        return [assignmentId, solutionId];
      }),
      switchMap(([assignmentId, solutionId]) => forkJoin([
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
      if (error.status === 401) {
        this.router.navigate(['token'], {relativeTo: this.route});
      }
    });
  }
}
