import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {EMPTY, of} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, share, switchMap, tap} from 'rxjs/operators';
import {ModalComponent} from '../../../../shared/modal/modal.component';
import {ToastService} from '../../../../toast.service';
import {UserService} from '../../../../user/user.service';
import {CodeSearchInfo, CreateEvaluationDto, Evaluation} from '../../../model/evaluation';
import {SearchSummary} from '../../../model/search-result';
import Solution from '../../../model/solution';
import Task from '../../../model/task';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {TelemetryService} from '../../../services/telemetry.service';
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
  comments: string[] = [];
  evaluation?: Evaluation;
  dto: CreateEvaluationDto = {
    task: '',
    author: '',
    remark: '',
    points: 0,
    snippets: [],
  };

  originEvaluation?: Evaluation;
  originSolution?: Solution;

  derivedSolutionCount?: number;

  searchSummary?: SearchSummary;

  constructor(
    private assignmentService: AssignmentService,
    private taskService: TaskService,
    private solutionService: SolutionService,
    private selectionService: SelectionService,
    private users: UserService,
    private toastService: ToastService,
    private telemetryService: TelemetryService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, task}) => this.assignmentService.get(aid).pipe(
        tap(assignment => this.dto.codeSearch = !!assignment.classroom?.codeSearch),
        map(assignment => this.taskService.find(assignment.tasks, task)),
      )),
    ).subscribe(task => {
      this.task = task;
    });

    const evaluation$ = this.route.params.pipe(
      switchMap(({aid, sid, task}) => this.solutionService.getEvaluations(aid, sid, {task})),
      map(([evaluation]) => evaluation),
      share(),
    );

    evaluation$.subscribe(evaluation => {
      this.evaluation = evaluation;
      if (evaluation) {
        const {points, remark, snippets} = evaluation;
        this.dto = {...this.dto, points, remark, snippets};
      }
    });

    evaluation$.pipe(
      switchMap(evaluation => {
        const origin = evaluation?.codeSearch?.origin;
        return origin ? this.solutionService.getEvaluation(evaluation.assignment, undefined, origin) : of(undefined);
      }),
      tap(originEvaluation => this.originEvaluation = originEvaluation),
      switchMap(originEvaluation => originEvaluation ? this.solutionService.get(originEvaluation.assignment, originEvaluation.solution) : of(undefined)),
      tap(originSolution => this.originSolution = originSolution),
    ).subscribe();

    evaluation$.pipe(
      switchMap(evaluation => evaluation ? this.solutionService.getEvaluationValues<string>(evaluation.assignment, 'solution', {
        origin: evaluation._id,
        task: evaluation.task,
      }) : EMPTY),
    ).subscribe(solutionIds => this.derivedSolutionCount = solutionIds.length);

    this.route.params.pipe(
      switchMap(({aid, task}) => this.solutionService.getEvaluationValues<string>(aid, 'snippets.comment', {task})),
    ).subscribe(comments => this.comments = comments);

    const selection$ = this.route.params.pipe(
      switchMap(({aid, sid}) => this.selectionService.stream(aid, sid)),
      filter(({selection: {author}}) => author === this.dto.author),
      map(({selection}) => selection),
      share(),
    );

    selection$.subscribe(({author, snippet}) => {
      let index = this.dto.snippets.findIndex(s => s.comment === this.selectionComment);
      if (index >= 0) {
        this.dto.snippets[index] = snippet;
      } else {
        index = this.dto.snippets.push(snippet) - 1;
      }
      setTimeout(() => document.getElementById('snippet-' + index)?.focus());
    });

    selection$.pipe(
      map(({snippet: {code}}) => code),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(code => this.assignmentService.searchSummary(this.route.snapshot.params.aid, code, this.task?.glob)),
    ).subscribe(summary => {
      this.searchSummary = summary;
    });
  }

  ngOnDestroy(): void {
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.doSubmit();
      this.modal.close();
    }
  }

  deleteSnippet(index: number) {
    this.dto.snippets.splice(index, 1);
  }

  doSubmit(): void {
    const {aid, sid, task} = this.route.snapshot.params;
    this.dto.task = task;

    this.dto.snippets.removeFirst(s => s.comment === this.selectionComment);

    this.telemetryService.create(aid, sid, {
      timestamp: new Date(),
      task,
      author: this.dto.author,
      action: 'submitEvaluation',
    }).subscribe();

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
