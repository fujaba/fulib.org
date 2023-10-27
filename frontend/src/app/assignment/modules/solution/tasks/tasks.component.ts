import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import Assignment, {ReadAssignmentDto} from '../../../model/assignment';
import {Evaluation} from '../../../model/evaluation';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {EvaluationService} from "../../../services/evaluation.service";
import {ConfigService} from "../../../services/config.service";
import {SolutionContainerService} from "../../../services/solution-container.service";
import {ToastService} from "@mean-stream/ngbx";
import {AssigneeService} from "../../../services/assignee.service";
import {UpdateAssigneeDto} from "../../../model/assignee";

@Component({
  selector: 'app-solution-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class SolutionTasksComponent implements OnInit, OnDestroy {
  assignment?: ReadAssignmentDto;
  solution?: Solution;
  points?: Record<string, number>;
  evaluations?: Record<string, Evaluation>;

  subscription?: Subscription;
  evaluating = false;
  config = this.configService.getAll();
  launching = false;
  assignee?: UpdateAssigneeDto;

  constructor(
    private assignmentService: AssignmentService,
    private evaluationService: EvaluationService,
    private solutionService: SolutionService,
    private solutionContainerService: SolutionContainerService,
    private toastService: ToastService,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private assigneeService: AssigneeService,
    private configService: ConfigService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => this.solutionService.get(aid, sid)),
    ).subscribe(solution => this.solution = solution);

    this.route.params.pipe(
      switchMap(({aid, sid}) => this.assigneeService.findOne(aid, sid)),
    ).subscribe(assignee => {
      assignee.duration ||= 0;
      this.assignee = assignee;
    });

    this.route.params.pipe(
      switchMap(({aid, sid}) => forkJoin([
        this.assignmentService.get(aid).pipe(tap(assignment => this.assignment = assignment)),
        this.evaluationService.findAll(aid, sid).pipe(map(evaluations => {
          this.evaluations = {};
          for (const evaluation of evaluations) {
            this.evaluations[evaluation.task] = evaluation;
          }
          return this.evaluations;
        })),
      ])),
    ).subscribe(([assignment, evaluations]) => {
      this.points = this.taskService.createPointsCache(assignment.tasks, evaluations);
    });

    this.subscription = this.route.params.pipe(
      switchMap(({aid, sid}) => this.evaluationService.stream(aid, sid)),
    ).subscribe(({event, evaluation}) => {
      if (!this.assignment || !this.evaluations) {
        return;
      }

      const task = evaluation.task;
      if (event === 'deleted') {
        delete this.evaluations[task];
      } else {
        this.evaluations[task] = evaluation;
      }

      if (!this.points) {
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

  launch() {
    if (this.launching || !this.assignment || !('token' in this.assignment)) {
      return;
    }

    this.launching = true;
    this.solutionContainerService.launch(this.assignment as Assignment, this.solution!).subscribe({
      next: container => {
        open(container.url, '_blank');
        this.launching = false;
      },
      error: error => {
        this.toastService.error('Launch in Projects', 'Failed to launch in Projects', error)
        this.launching = false;
      },
    });
  }

  saveDuration() {
    if (!this.assignee) {
      return;
    }
    if (this.assignee.assignee !== this.config.name && !confirm('You are not assigned to this solution. Do you want to assign yourself and save the duration?')) {
      return;
    }
    this.assigneeService.update(this.assignment!._id, this.solution!._id!, {
      duration: this.assignee.duration,
      assignee: this.config.name,
    }).subscribe({
      next: () => this.toastService.success('Finish Evaluation', 'Successfully saved duration'),
      error: error => this.toastService.error('Finish Evaluation', 'Failed to save duration', error),
    });
  }
}
