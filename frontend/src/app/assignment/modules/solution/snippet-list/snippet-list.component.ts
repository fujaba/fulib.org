import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CreateEvaluationDto, Snippet} from "../../../model/evaluation";
import {merge, Observable, Subject, Subscription} from "rxjs";
import {SearchSummary} from "../../../model/search-result";
import {debounceTime, distinctUntilChanged, filter, map, share, switchMap} from "rxjs/operators";
import {AssignmentService} from "../../../services/assignment.service";
import {SelectionDto, SelectionService} from "../../../services/selection.service";
import {ConfigService} from "../../../services/config.service";
import {EvaluationService} from "../../../services/evaluation.service";
import {EmbeddingService} from "../../../services/embedding.service";
import {ActivatedRoute} from "@angular/router";
import Task from "../../../model/task";

export const selectionComment = '(fulibFeedback Selection)';

@Component({
  selector: 'app-snippet-list',
  templateUrl: './snippet-list.component.html',
  styleUrls: ['./snippet-list.component.scss']
})
export class SnippetListComponent implements OnInit, OnDestroy {
  @Input({required: true}) task?: Task;
  @Input({required: true}) dto: CreateEvaluationDto;

  comments: string[] = [];

  snippetUpdates$ = new Subject<Snippet>();
  searchSummary?: SearchSummary & { level: string, message?: string, code: string };

  embeddingSnippets: Snippet[] = [];

  codeSearchEnabled = this.configService.getBool('codeSearch');
  snippetSuggestionsEnabled = this.configService.getBool('snippetSuggestions');

  private subscriptions = new Subscription();

  readonly selectionComment = selectionComment;

  constructor(
    private assignmentService: AssignmentService,
    private selectionService: SelectionService,
    private configService: ConfigService,
    private evaluationService: EvaluationService,
    private embeddingService: EmbeddingService,
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.loadCommentValues();

    if (this.snippetSuggestionsEnabled) {
      this.loadEmbeddingRelatedSnippets();
    }

    const selection$ = this.route.params.pipe(
      switchMap(({aid, sid}) => this.selectionService.stream(aid, sid)),
      filter(({selection: {author}}) => author === this.dto.author),
      map(({selection}) => selection),
      filter(({snippet}) => !!snippet.code.trim()),
      share(),
    );

    this.listenForSelectionSnippets(selection$);

    if (this.codeSearchEnabled) {
      this.listenForCodeSearch(selection$);
    }
  }

  private loadCommentValues() {
    this.route.params.pipe(
      switchMap(({aid, task}) => this.evaluationService.distinctValues<string>(aid, 'snippets.comment', {task})),
    ).subscribe(comments => this.comments = comments);
  }

  private loadEmbeddingRelatedSnippets() {
    this.route.params.pipe(
      switchMap(({aid, sid, task}) => this.embeddingService.findTaskRelatedSnippets(aid, sid, task)),
    ).subscribe(snippets => this.embeddingSnippets = snippets);
  }

  private listenForSelectionSnippets(selection$: Observable<SelectionDto>) {
    this.subscriptions.add(selection$.subscribe(({snippet}) => {
      let index = this.dto.snippets.findIndex(s => s.comment === this.selectionComment);
      if (index >= 0) {
        this.dto.snippets[index] = snippet;
      } else {
        index = this.dto.snippets.push(snippet) - 1;
      }
      setTimeout(() => document.getElementById('snippet-' + index)?.focus());
    }));
  }

  private listenForCodeSearch(selection$: Observable<SelectionDto>) {
    this.subscriptions.add(merge(
      selection$.pipe(map(sel => sel.snippet.code)),
      this.snippetUpdates$.pipe(map(snippet => snippet.pattern ?? snippet.code)),
    ).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(code => this.assignmentService.searchSummary(this.route.snapshot.params.aid, code, this.task?.glob, '***').pipe(
        map(searchSummary => ({...searchSummary, code})),
      )),
    ).subscribe(summary => {
      this.setSummary(summary);
    }));
  }

  private setSummary(summary: SearchSummary & { code: string }) {
    let level: string;
    let message: string | undefined;
    if (!summary.hits) {
      level = 'warning';
      message = 'No result indicates the snippet is not part of the submitted code for this solution. Please make sure you checked out the correct commit.';
    } else if (summary.files > summary.solutions) {
      level = 'danger';
      message = 'The snippet was found in multiple files per solution. It most likely does not provide enough context.';
    } else if (summary.hits > summary.files) {
      level = 'warning';
      message = 'The snippet was found in multiple places per file. It probably does not provide enough context.';
    } else {
      level = 'success';
    }

    this.searchSummary = {
      ...summary,
      level,
      message,
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  confirmEmbedding(snippet: Snippet) {
    this.embeddingSnippets.splice(this.embeddingSnippets.indexOf(snippet), 1);
    this.dto.snippets.push(snippet);
    snippet.score = undefined;
    this.snippetUpdates$.next(snippet);
  }

  deleteSnippet(index: number) {
    this.dto.snippets.splice(index, 1);
  }
}
