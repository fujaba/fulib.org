import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {UserService} from '../../../user/user.service';
import {CreateEvaluationDto, Evaluation} from '../../model/evaluation';
import {SolutionService} from '../../services/solution.service';

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

  private userSubscription: Subscription;

  constructor(
    private solutionService: SolutionService,
    private users: UserService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.dto.author = this.solutionService.commentName || '';

    this.route.params.pipe(
      switchMap(({aid, sid, task}) => this.solutionService.getEvaluations(aid, sid, task)),
    ).subscribe(evaluations => {
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
      this.evaluation = result;
    });
  }
}
