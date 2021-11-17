import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {EMPTY, forkJoin, Subscription} from 'rxjs';
import {filter, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {Marker} from '../../../../shared/model/marker';
import Assignment from '../../../model/assignment';
import {Evaluation} from '../../../model/evaluation';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';

@Component({
  selector: 'app-solution-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class SolutionTasksComponent implements OnInit, OnDestroy {
  assignment?: Assignment;
  solution?: Solution;
  points?: Record<string, number>;
  evaluations?: Record<string, Evaluation>;
  markers: Marker[] = [];

  subscription?: Subscription;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
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

    this.subscription = this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      // NB: Using mergeMap instead of switchMap because we need to update
      // all evaluations that might have changed in the meantime.
      mergeMap(() => {
        const firstChild = this.route.firstChild;
        if (!firstChild) {
          return EMPTY;
        }
        const {aid, sid} = this.route.snapshot.params;
        const {task} = firstChild.snapshot.params;
        if (!task) {
          return EMPTY;
        }

        return this.solutionService.getEvaluations(aid, sid, task).pipe(map(e => [e[0], task] as const));
      }),
    ).subscribe(([evaluation, task]) => {
      if (!this.assignment || !this.points || !this.evaluations) {
        return;
      }

      const oldEvaluation = this.evaluations[task];
      this.evaluations[task] = evaluation;
      if (evaluation?.points === oldEvaluation?.points) {
        return;
      }

      // Clear cache for affected tasks
      const tasks = this.taskService.findWithParents(this.assignment.tasks, task);
      for (let task of tasks) {
        delete this.points[task._id];
      }

      // Restore cache
      for (let task of this.assignment.tasks) {
        this.taskService.getTaskPoints(task, this.evaluations, this.points);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
