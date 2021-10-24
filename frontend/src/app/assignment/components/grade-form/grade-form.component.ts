import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {CreateEvaluationDto, Evaluation} from '../../model/evaluation';
import Solution from '../../model/solution';
import {SolutionService} from '../../services/solution.service';
import {UserService} from '../../../user/user.service';

@Component({
  selector: 'app-grade-form',
  templateUrl: './grade-form.component.html',
  styleUrls: ['./grade-form.component.scss'],
})
export class GradeFormComponent implements OnInit, OnDestroy {
  @Input() solution: Solution;
  @Input() task: string;
  @Input() evaluation?: CreateEvaluationDto | Evaluation;
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
  ) {
  }

  ngOnInit(): void {
    this.dto.task = this.task;
    this.dto.author = this.solutionService.commentName || '';

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
    const {assignment, _id: solution} = this.solution;
    const op = this.evaluation && '_id' in this.evaluation
      ? this.solutionService.updateEvaluation(assignment, solution!, this.evaluation._id, this.dto)
      : this.solutionService.createEvaluation(assignment, solution!, this.dto);
    op.subscribe(result => {
      this.evaluation = result;
    });
  }
}
