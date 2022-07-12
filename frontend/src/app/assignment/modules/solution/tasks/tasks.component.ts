import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {Marker} from '../../../../shared/model/marker';
import Assignment from '../../../model/assignment';
import {Evaluation} from '../../../model/evaluation';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {EvaluationRepo} from '../../../services/evaluation-repo';
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
    private evaluationRepo: EvaluationRepo,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid: assignment, sid: solution}) => forkJoin([
        this.assignmentService.get(assignment).pipe(tap(assignment => this.assignment = assignment)),
        this.solutionService.get(assignment, solution).pipe(tap(solution => this.solution = solution)),
        this.evaluationRepo.findAll({assignment, solution}).pipe(tap(evaluations => {
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

    this.subscription = this.route.params.pipe(
      switchMap(({aid: assignment, sid: solution}) => this.evaluationRepo.stream({assignment, solution})),
    ).subscribe(({event, evaluation}) => {
      if (!this.assignment || !this.evaluations) {
        return;
      }

      const task = evaluation.task;
      const newEvaluation = event === 'deleted' ? undefined : evaluation;
      const oldEvaluation = this.evaluations[task];
      this.evaluations[task] = newEvaluation!;
      if (!this.points || newEvaluation?.points === oldEvaluation?.points) {
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
