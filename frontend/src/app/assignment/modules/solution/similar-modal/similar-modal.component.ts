import {Component, OnInit} from '@angular/core';
import Task from "../../../model/task";
import Solution from "../../../model/solution";
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
  dto: CreateEvaluationDto = {
    task: '',
    points: 0,
    remark: '',
    snippets: [],
    author: this.configService.get('name'),
    codeSearch: false,
  };
  solutions: Solution[] = [];
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


    this.route.params.pipe(
      switchMap(({aid, task}) => this.evaluationService.distinctValues<string>(aid, 'solution', {task})),
    ).subscribe(ids => {
      this.existingEvaluations = Object.fromEntries(ids.map(id => [id, true]));
    })

    this.route.params.pipe(
      switchMap(({aid, sid, task}) => this.evaluationService.findByTask(aid, sid, task)),
      filter((e): e is Evaluation => !!e),
      tap(evaluation => {
        this.evaluation = evaluation;
        this.dto.remark = evaluation.remark;
        this.dto.points = evaluation.points;
      }),
      switchMap(evaluation => forkJoin(evaluation.snippets
        .map(snippet => this.embeddingService.findSimilarSnippets(evaluation.assignment, evaluation.solution, snippet))
      )),
      map(result => {
        this.snippets = {};
        for (let snippetIndex = 0; snippetIndex < result.length; snippetIndex++) {
          for (const snippet of result[snippetIndex]) {
            (this.snippets[snippet.solution] ||= [])[snippetIndex] ||= snippet;
          }
        }
        return this.snippets;
      }),
      switchMap(snippets => forkJoin(Object.keys(snippets)
        .map(solution => this.solutionService.get(this.route.snapshot.params.aid, solution)),
      )),
      tap(solutions => this.solutions = solutions),
    ).subscribe();
  }

  submit() {
    const assignment = this.route.snapshot.params.aid;
    forkJoin(Object.entries(this.selection)
      .filter(([, selected]) => selected)
      .map(([solution]) => this.evaluationService.create(assignment, solution, {
        ...this.dto,
        snippets: this.snippets[solution] || [],
      }))
    ).subscribe(results => {
      this.toastService.success('Submit Evaluations', `Successfully submitted ${results.length} evaluations`);
    });
  }
}
