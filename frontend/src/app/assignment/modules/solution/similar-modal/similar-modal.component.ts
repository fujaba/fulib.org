import {Component, OnInit} from '@angular/core';
import Task from "../../../model/task";
import {RichSolutionDto} from "../../../model/solution";
import {CreateEvaluationDto, Evaluation, Snippet} from "../../../model/evaluation";
import {ActivatedRoute} from "@angular/router";
import {AssignmentService} from "../../../services/assignment.service";
import {SolutionService} from "../../../services/solution.service";
import {filter, map, switchMap, tap} from "rxjs/operators";
import {TaskService} from "../../../services/task.service";
import {ConfigService} from "../../../services/config.service";
import {forkJoin} from "rxjs";
import {ToastService} from "@mean-stream/ngbx";
import {EvaluationService} from "../../../services/evaluation.service";
import {EmbeddingService} from "../../../services/embedding.service";

@Component({
  selector: 'app-similar-modal',
  templateUrl: './similar-modal.component.html',
  styleUrls: ['./similar-modal.component.scss']
})
export class SimilarModalComponent implements OnInit {
  solutionId!: string;
  task?: Task;
  evaluation?: Evaluation;
  startDate = Date.now();
  dto: CreateEvaluationDto = {
    task: '',
    points: 0,
    remark: '',
    snippets: [],
    author: this.configService.get('name'),
    codeSearch: false,
  };
  solutions: RichSolutionDto[] = [];
  selection: Partial<Record<string, boolean>> = {};
  existingEvaluations: Partial<Record<string, boolean>> = {};
  snippets: Partial<Record<string, Snippet[]>> = {};

  constructor(
    public route: ActivatedRoute,
    private taskService: TaskService,
    private toastService: ToastService,
    private configService: ConfigService,
    private solutionService: SolutionService,
    private evaluationService: EvaluationService,
    private assignmentService: AssignmentService,
    private embeddingService: EmbeddingService,
  ) {
  }

  ngOnInit(): void {
    this.dto.task = this.route.snapshot.params.task;

    this.route.params.subscribe(({sid}) => this.solutionId = sid);

    this.route.params.pipe(
      switchMap(({aid, task}) => this.assignmentService.get(aid).pipe(
        map(assignment => this.taskService.find(assignment.tasks, task)),
      )),
    ).subscribe(task => this.task = task);

    // load solution IDs that already have an evaluation for this task
    this.route.params.pipe(
      switchMap(({aid, task}) => this.evaluationService.distinctValues<string>(aid, 'solution', {task})),
    ).subscribe(ids => {
      this.existingEvaluations = Object.fromEntries(ids.map(id => [id, true]));
    })

    this.route.params.pipe(
      // load the original evaluation to get remark, points and snippets
      switchMap(({aid, sid, task}) => this.evaluationService.findByTask(aid, sid, task)),
      filter((e): e is Evaluation => !!e),
      tap(evaluation => {
        this.evaluation = evaluation;
        this.dto.remark = evaluation.remark;
        this.dto.points = evaluation.points;
      }),
      // for each snippet, find similar snippets
      switchMap(evaluation => forkJoin(evaluation.snippets
        .map(snippet => this.embeddingService.findSimilarSnippets(evaluation.assignment, evaluation.solution, snippet))
      )),
      // group snippets by solution and ordered by index of the original snippet
      map(result => {
        this.snippets = {};
        for (let snippetIndex = 0; snippetIndex < result.length; snippetIndex++) {
          for (const snippet of result[snippetIndex]) {
            (this.snippets[snippet.solution] ||= [])[snippetIndex] ||= snippet;
          }
        }
        return this.snippets;
      }),
      // fetch the solutions
      switchMap(snippets => this.solutionService.getAll(this.route.snapshot.params.aid, undefined, Object.keys(snippets))),
      tap(solutions => this.solutions = solutions),
    ).subscribe();
  }

  submit() {
    const assignment = this.route.snapshot.params.aid;
    // for each selected solution, create an evaluation
    const selected = Object.entries(this.selection).filter(([, selected]) => selected);
    const duration = (Date.now() - this.startDate) / 1000 / selected.length;

    forkJoin(selected
      .map(([solution]) => this.evaluationService.create(assignment, solution, {
        ...this.dto,
        duration,
        similarity: this.evaluation && {
          origin: this.evaluation._id,
        },
        snippets: this.snippets[solution] ?? [],
      }))
    ).subscribe(results => {
      this.toastService.success('Submit Evaluations', `Successfully submitted ${results.length} evaluations`);
    });
  }
}
