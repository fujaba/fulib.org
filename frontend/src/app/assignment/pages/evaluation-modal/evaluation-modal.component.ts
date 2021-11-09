import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {ToastService} from '../../../toast.service';
import {UserService} from '../../../user/user.service';
import {CreateEvaluationDto, Evaluation} from '../../model/evaluation';
import {AssignmentService} from '../../services/assignment.service';
import {SolutionService} from '../../services/solution.service';
import {TaskService} from '../../services/task.service';

@Component({
  selector: 'app-evaluation-modal',
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.scss'],
})
export class EvaluationModalComponent implements OnInit, OnDestroy {
  evaluation?: Evaluation;
  dto: CreateEvaluationDto = {
    task: '',
    author: '',
    remark: '',
    points: 0,
    snippets: [],
  };

  loggedIn = false;
  min?: number;
  max?: number;

  private userSubscription: Subscription;

  constructor(
    private assignmentService: AssignmentService,
    private taskService: TaskService,
    private solutionService: SolutionService,
    private users: UserService,
    private toastService: ToastService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.dto.author = this.solutionService.commentName || '';

    this.route.params.pipe(
      switchMap(({aid, sid, task}) => forkJoin(
        this.assignmentService.get(aid).pipe(map(assignment => this.taskService.find(assignment.tasks, task))),
        this.solutionService.getEvaluations(aid, sid, task),
      )),
    ).subscribe(([task, evaluations]) => {
      if (task) {
        this.min = Math.min(task.points, 0);
        this.max = Math.max(task.points, 0);
      }
      this.evaluation = evaluations[0];
    });

    this.userSubscription = this.users.current$.subscribe(user => {
      if (user) {
        this.loggedIn = true;
        this.dto.author = `${user.firstName} ${user.lastName}`;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  saveDraft(): void {
    this.solutionService.commentName = this.dto.author;
  }

  doSubmit(): void {
    const {aid, sid, task} = this.route.snapshot.params;
    this.dto.task = task;
    const op = this.evaluation
      ? this.solutionService.updateEvaluation(aid, sid, this.evaluation._id, this.dto)
      : this.solutionService.createEvaluation(aid, sid, this.dto);
    op.subscribe(result => {
      this.toastService.success('Evaluation', `Successfully ${this.evaluation ? 'updated' : 'created'} evaluation`);
      this.evaluation = result;
    }, error => {
      this.toastService.error('Evaluation', `Failed to ${this.evaluation ? 'update' : 'create'} evaluation`, error);
    });
  }
}
