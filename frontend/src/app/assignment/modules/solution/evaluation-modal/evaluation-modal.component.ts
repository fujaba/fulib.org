import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalComponent, ToastService} from '@mean-stream/ngbx';
import {EMPTY, Observable, of, Subscription} from 'rxjs';
import {filter, share, switchMap, tap} from 'rxjs/operators';
import {CodeSearchInfo, CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import Solution from '../../../model/solution';
import Task from '../../../model/task';
import {AssignmentService} from '../../../services/assignment.service';
import {ConfigService} from '../../../services/config.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {EvaluationService} from "../../../services/evaluation.service";
import {selectionComment} from "../snippet-list/snippet-list.component";
import {ReadAssignmentDto} from "../../../model/assignment";


@Component({
  selector: 'app-evaluation-modal',
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.scss'],
})
export class EvaluationModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal', {static: true}) modal: ModalComponent;

  codeSearchEnabled = this.configService.getBool('codeSearch');
  similarSolutionsEnabled = this.configService.getBool('similarSolutions');

  startDate = Date.now();
  task?: Task;
  evaluation?: Evaluation;
  dto: CreateEvaluationDto = {
    task: '',
    author: this.configService.get('name'),
    remark: '',
    points: 0,
    snippets: [],
    codeSearch: this.codeSearchEnabled,
  };

  originEvaluation?: Evaluation;
  originSolution?: Solution;

  derivedSolutionCount?: number;

  viewSimilar = this.similarSolutionsEnabled;

  subscriptions = new Subscription();

  constructor(
    private assignmentService: AssignmentService,
    private taskService: TaskService,
    private solutionService: SolutionService,
    private configService: ConfigService,
    private toastService: ToastService,
    private evaluationService: EvaluationService,
    public route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    const assignment$ = this.route.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
      share(),
    );

    this.loadCodeSearchEnabled(assignment$);
    this.loadTask(assignment$);

    const evaluation$ = this.route.params.pipe(
      switchMap(({aid, sid, task}) => this.evaluationService.findByTask(aid, sid, task)),
      // TODO Remove this after the Winter Term 2023/24 study is over
      filter(evaluation => this.codeSearchEnabled || evaluation?.author !== 'Code Search'),
      share(),
    );

    this.loadEvaluation(evaluation$);
    this.loadOriginEvaluationAndSolution(evaluation$);
    this.loadDerivedSolutions(evaluation$);
  }

  private loadCodeSearchEnabled(assignment$: Observable<ReadAssignmentDto>) {
    this.subscriptions.add(assignment$.subscribe(assignment => {
      if (!assignment.classroom?.codeSearch) {
        this.dto.codeSearch = this.codeSearchEnabled = false;
      }
      if (!assignment.classroom?.openaiApiKey) {
        this.viewSimilar = this.similarSolutionsEnabled = false;
      }
    }));
  }

  private loadTask(assignment$: Observable<ReadAssignmentDto>) {
    this.subscriptions.add(assignment$.subscribe(assignment => {
      this.task = this.taskService.find(assignment.tasks, this.route.snapshot.params.task);
    }));
  }

  private loadEvaluation(evaluation$: Observable<Evaluation | undefined>) {
    this.subscriptions.add(evaluation$.subscribe(evaluation => {
      this.evaluation = evaluation;
      if (evaluation) {
        const {points, remark, snippets} = evaluation;
        this.dto = {...this.dto, points, remark, snippets};
      }
    }));
  }

  private loadOriginEvaluationAndSolution(evaluation$: Observable<Evaluation | undefined>) {
    this.subscriptions.add(evaluation$.pipe(
      switchMap(evaluation => {
        const origin = evaluation?.codeSearch?.origin;
        return origin ? this.evaluationService.findOne(evaluation.assignment, undefined, origin) : EMPTY;
      }),
      tap(originEvaluation => this.originEvaluation = originEvaluation),
      switchMap(originEvaluation => originEvaluation ? this.solutionService.get(originEvaluation.assignment, originEvaluation.solution) : of(undefined)),
      tap(originSolution => this.originSolution = originSolution),
    ).subscribe());
  }

  private loadDerivedSolutions(evaluation$: Observable<Evaluation | undefined>) {
    this.subscriptions.add(evaluation$.pipe(
      switchMap(evaluation => evaluation ? this.evaluationService.distinctValues<string>(evaluation.assignment, 'solution', {
        origin: evaluation._id,
        task: evaluation.task,
      }) : EMPTY),
    ).subscribe(solutionIds => this.derivedSolutionCount = solutionIds.length));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.doSubmit();
      this.modal.close();
    }
  }

  doSubmit(): void {
    const {aid, sid, task} = this.route.snapshot.params;
    this.dto.task = task;

    this.dto.snippets.removeFirst(s => s.comment === selectionComment);

    if (!this.evaluation) {
      this.dto.duration = (Date.now() - this.startDate) / 1000;
    }

    const op = this.evaluation
      ? this.evaluationService.update(aid, sid, this.evaluation._id, this.dto)
      : this.evaluationService.create(aid, sid, this.dto);
    op.subscribe(result => {
      const op = this.evaluation ? 'updated' : 'created';
      this.toastService.success('Evaluation', `Successfully ${op} evaluation${this.codeSearchInfo(result.codeSearch)}`);
      this.evaluation = result;

      if (this.viewSimilar && result.snippets.length) {
        this.router.navigate(['similar'], {relativeTo: this.route});
      }
    }, error => {
      this.toastService.error('Evaluation', `Failed to ${this.evaluation ? 'update' : 'create'} evaluation`, error);
    });
  }

  delete(): boolean {
    if (!this.evaluation || !confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
      return false;
    }

    const {aid, sid} = this.route.snapshot.params;
    this.evaluationService.delete(aid, sid, this.evaluation._id).subscribe(result => {
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
