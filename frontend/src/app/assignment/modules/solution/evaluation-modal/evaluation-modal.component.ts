import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {concat, from, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {concatMap, debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {ModalComponent} from '../../../../shared/modal/modal.component';
import {ToastService} from '../../../../toast.service';
import {UserService} from '../../../../user/user.service';
import {CodeSearchInfo, CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import Solution from '../../../model/solution';
import Task from '../../../model/task';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {SelectionService} from '../selection.service';

export const selectionComment = '(fulibFeedback Selection)';

@Component({
  selector: 'app-evaluation-modal',
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.scss'],
})
export class EvaluationModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal', {static: true}) modal: ModalComponent;

  readonly selectionComment = selectionComment;

  task?: Task;
  remarks: string[] = [];
  comments: string[] = [];
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
  multilineRemark = 0;

  originEvaluation?: Evaluation;
  originSolution?: Solution;

  private userSubscription: Subscription;

  remarkFocus$ = new Subject<string>();

  remarkTypeahead = (text$: Observable<string>): Observable<string[]> => merge(
    this.remarkFocus$,
    text$.pipe(debounceTime(200)),
  ).pipe(
    distinctUntilChanged(),
    map(searchInput => this.remarks.filter(r => r.includes(searchInput))),
  );

  constructor(
    private assignmentService: AssignmentService,
    private taskService: TaskService,
    private solutionService: SolutionService,
    private selectionService: SelectionService,
    private users: UserService,
    private toastService: ToastService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.dto.author = this.solutionService.commentName || '';

    this.route.params.pipe(
      switchMap(({aid, task}) => this.assignmentService.get(aid).pipe(
        tap(assignment => this.dto.codeSearch = !!assignment.classroom?.codeSearch),
        map(assignment => this.taskService.find(assignment.tasks, task)),
      )),
    ).subscribe(task => {
      this.task = task;
      if (task) {
        this.min = Math.min(task.points, 0);
        this.max = Math.max(task.points, 0);
      }
    });

    this.route.params.pipe(
      switchMap(({aid, sid, task}) => this.solutionService.getEvaluations(aid, sid, task)),
      map(([evaluation]) => evaluation),
      tap(evaluation => {
        this.evaluation = evaluation;
        if (evaluation) {
          this.dto.points = evaluation.points;
          this.dto.remark = evaluation.remark;
          this.dto.snippets = evaluation.snippets;
          this.multilineRemark = evaluation.remark.split('\n').length;
        }
      }),
      switchMap(evaluation => {
        const origin = evaluation?.codeSearch?.origin;
        return origin ? this.solutionService.getEvaluation(evaluation.assignment, undefined, origin) : of(undefined);
      }),
      tap(originEvaluation => this.originEvaluation = originEvaluation),
      switchMap(originEvaluation => originEvaluation ? this.solutionService.get(originEvaluation.assignment, originEvaluation.solution) : of(undefined)),
      tap(originSolution => this.originSolution = originSolution),
    ).subscribe();

    this.route.params.pipe(
      switchMap(({aid, task}) => this.solutionService.getEvaluations(aid, undefined, task)),
    ).subscribe(evaluations => {
      this.remarks = [...new Set(evaluations.map(e => e.remark).filter(x => x))].sort();
      const comments = new Set<string>();
      for (const {snippets} of evaluations) {
        for (const {comment} of snippets) {
          comment && comments.add(comment);
        }
      }
      this.comments = [...comments].sort();
    });

    this.userSubscription = this.users.current$.subscribe(user => {
      if (user) {
        this.loggedIn = true;
        this.dto.author = `${user.firstName} ${user.lastName}`;
      }
    });

    const selectionSubscription = this.route.params.pipe(
      switchMap(({aid, sid}) => concat(
        this.selectionService.getAll(aid, sid).pipe(concatMap(from)),
        this.selectionService.stream(aid, sid),
      )),
    ).subscribe(({author, snippet}) => {
      if (author !== this.dto.author) {
        return;
      }
      let index = this.dto.snippets.findIndex(s => s.comment === this.selectionComment);
      if (index >= 0) {
        this.dto.snippets[index] = snippet;
      } else {
        index = this.dto.snippets.push(snippet) - 1;
      }
      setTimeout(() => document.getElementById('snippet-' + index)?.focus());
    });
    this.userSubscription.add(selectionSubscription);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (!event.ctrlKey) {
      return;
    }

    switch (event.key) {
      case '0':
        this.setPoints(0);
        return;
      case 'Enter':
        this.doSubmit();
        this.modal.close();
        return;
    }
  }

  setPoints(points?: number) {
    this.dto.points = points ?? 0;
  }

  saveDraft(): void {
    this.solutionService.commentName = this.dto.author;
  }

  deleteSnippet(index: number) {
    this.dto.snippets.splice(index, 1);
  }

  doSubmit(): void {
    const {aid, sid, task} = this.route.snapshot.params;
    this.dto.task = task;

    this.dto.snippets.removeFirst(s => s.comment === this.selectionComment);

    const op = this.evaluation
      ? this.solutionService.updateEvaluation(aid, sid, this.evaluation._id, this.dto)
      : this.solutionService.createEvaluation(aid, sid, this.dto);
    op.subscribe(result => {
      const op = this.evaluation ? 'updated' : 'created';
      this.toastService.success('Evaluation', `Successfully ${op} evaluation${this.codeSearchInfo(result.codeSearch)}`);
      this.evaluation = result;
    }, error => {
      this.toastService.error('Evaluation', `Failed to ${this.evaluation ? 'update' : 'create'} evaluation`, error);
    });
  }

  delete(): boolean {
    if (!this.evaluation || !confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
      return false;
    }

    const {aid, sid} = this.route.snapshot.params;
    this.solutionService.deleteEvaluation(aid, sid, this.evaluation._id).subscribe(result => {
      this.toastService.warn('Evaluation', `Successfully deleted evaluation${this.codeSearchInfo(result.codeSearch)}`);
    }, error => {
      this.toastService.error('Evaluation', 'Failed to delete evaluation', error);
    });
    return true;
  }

  private codeSearchInfo(codeSearch?: CodeSearchInfo): string {
    if (!codeSearch) {
      return '';
    }
    const ops = [
      'created',
      'updated',
      'deleted',
    ];
    const info = ops
      .map(op => codeSearch[op] && `${op} ${codeSearch[op]}`)
      .filter(x => x)
    ;
    return info.length ? ` and ${info.join(', ')} via Code Search` : '';
  }
}
