import {Component, OnInit, TrackByFunction} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {ClipboardService} from 'ngx-clipboard';
import {BehaviorSubject, combineLatest, forkJoin, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Assignee} from '../../../model/assignee';
import Assignment, {ReadAssignmentDto} from '../../../model/assignment';
import Solution, {AuthorInfo, authorInfoProperties} from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {SubmitService} from "../submit.service";
import {UserService} from "../../../../user/user.service";
import {AssigneeService} from "../../../services/assignee.service";
import {EvaluationService} from "../../../services/evaluation.service";

type SearchKey = keyof AuthorInfo | 'assignee';
const searchKeys: readonly SearchKey[] = [
  'name',
  'studentId',
  'email',
  'github',
  'assignee',
];

@Component({
  selector: 'app-solution-table',
  templateUrl: './solution-table.component.html',
  styleUrls: ['./solution-table.component.scss'],
})
export class SolutionTableComponent implements OnInit {
  readonly searchableProperties = searchKeys;
  readonly authorProperties = authorInfoProperties;

  assignment?: Assignment | ReadAssignmentDto;
  totalPoints?: number;
  solutions: Solution[] = [];
  assignees: Partial<Record<string, string | undefined>> = {};
  assigneeNames: string[] = [];
  evaluated: Partial<Record<string, boolean>> = {};
  selected: Partial<Record<string, boolean>> = {};

  userToken?: string;

  loading = false;

  search$ = new BehaviorSubject<string>('');

  solutionId: TrackByFunction<Solution> = (index, s) => s._id;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private assigneeService: AssigneeService,
    private evaluationService: EvaluationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private taskService: TaskService,
    private clipboardService: ClipboardService,
    private submitService: SubmitService,
    private userService: UserService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => {
      this.assignment = assignment;
      this.totalPoints = this.taskService.sumPositivePoints(assignment.tasks);
    });

    this.activatedRoute.params.pipe(
      switchMap(({aid}) => this.assigneeService.findAll(aid)),
    ).subscribe(assignees => {
      this.assignees = {};
      const names = new Set<string>();
      for (const assignee of assignees) {
        names.add(assignee.assignee);
        this.assignees[assignee.solution] = assignee.assignee;
      }
      this.assigneeNames = [...names].sort();
    });

    this.activatedRoute.params.pipe(
      switchMap(({aid}) => forkJoin([
        this.evaluationService.distinctValues<string>(aid, 'solution', {codeSearch: false}),
        this.evaluationService.distinctValues<string>(aid, 'solution', {codeSearch: true}),
      ])),
    ).subscribe(([manual, codeSearch]) => {
      this.evaluated = {};
      for (const id of codeSearch) {
        this.evaluated[id] = false;
      }
      for (const id of manual) {
        this.evaluated[id] = true;
      }
    });

    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]).pipe(
      tap(() => this.loading = true),
      tap(([, {q}]) => this.search$.next(q)),
      switchMap(([{aid}, {q}]) => this.solutionService.getAll(aid, q)),
    ).subscribe(solutions => {
      this.solutions = solutions;
      this.loading = false;
    });

    this.search$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe(q => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {q},
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    this.userService.getGitHubToken().subscribe(token => this.userToken = token);
  }

  select(id: string, selected: boolean) {
    if (selected) {
      this.selected[id] = selected;
    } else {
      delete this.selected[id];
    }
  }

  selectAll(selected: boolean) {
    if (selected) {
      for (const {_id} of this.solutions) {
        this.selected[_id!] = true;
      }
    } else {
      this.selected = {};
    }
  }

  typeahead = (text$: Observable<string>): Observable<string[]> => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(searchInput => this.autoComplete(searchInput)),
    );
  };

  formatTypeahead = (suggestion: string): string => {
    const lastSpaceIndex = suggestion.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      return '... ' + suggestion.substring(lastSpaceIndex + 1);
    }
    return suggestion;
  };

  private autoComplete(searchInput: string): string[] {
    const lastSpaceIndex = searchInput.lastIndexOf(' ');
    // two substrings below also work if lastSpaceIndex == -1
    const prefix = searchInput.substring(0, lastSpaceIndex + 1);
    const lastWord = searchInput.substring(lastSpaceIndex + 1);

    const results: string[] = [];
    for (const propertyName of this.searchableProperties) {
      const propertyPrefix = propertyName + ':';
      if (propertyName.startsWith(lastWord)) {
        results.push(prefix + propertyPrefix);
      } else if (lastWord.startsWith(propertyPrefix)) {
        const possibleValues = this.collectAllValues(propertyName).slice(0, 10);
        results.push(...possibleValues.map(v => prefix + propertyPrefix + v.replace(/ /g, '+')));
      }
    }
    return results;
  }

  private collectAllValues(key: SearchKey): string[] {
    if (key === 'assignee') {
      return this.assigneeNames;
    }
    const valueSet = new Set<string>();
    for (const solution of this.solutions!) {
      const propertyValue = solution.author[key];
      if (propertyValue) {
        valueSet.add(propertyValue);
      }
    }
    return [...valueSet].sort();
  }

  copyTimestamp() {
    this.copy('Timestamp', s => {
      if (!s.timestamp) {
        return '';
      }
      const date = new Date(s.timestamp);
      // format as YYYY-MM-DD HH:mm:ss (local time) to be understood by Excel
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    });
  }

  copyPoints() {
    this.copy('Points', s => (s.points ?? '').toString());
  }

  copyAssignee() {
    this.copy('Assignees', s => this.assignees[s._id!] ?? '');
  }

  copyAuthor(name: string, key: keyof AuthorInfo) {
    this.copy(name, s => s.author[key] ?? '');
  }

  copy(name: string, select: (s: Solution) => string) {
    this.clipboardService.copy(this.solutions!.map(select).join('\n'));
    this.toastService.success(`Copy ${name}`, `Copied ${this.solutions.length} rows to clipboard`);
  }

  openSelected() {
    for (let i = this.solutions.length - 1; i >= 0; i--) {
      const {_id} = this.solutions[i];
      if (_id && this.selected[_id]) {
        open(`${location.href}/${_id}`, '_blank');
      }
    }
  }

  deleteSelected() {
    const ids = Object.keys(this.selected);
    this.solutionService.deleteAll(this.assignment!._id!, ids).subscribe(() => {
      this.toastService.success('Delete Solutions', `Successfully deleted ${ids.length} solutions`);
      this.selected = {};
      this.solutions = this.solutions.filter(s => !ids.includes(s._id!));
    }, error => {
      this.toastService.error('Delete Solutions', 'Failed to delete solutions', error);
    });
  }

  async submitSelected() {
    const {assignment, userToken} = this;
    if (!userToken || !assignment?.classroom?.org || !assignment.classroom.prefix) {
      return;
    }

    const result = await Promise.all(this.solutions
      .filter(s => this.selected[s._id!] && s.author.github)
      .map(async solution => {
        const issue = await this.submitService.createIssue(assignment, solution);
        await this.submitService.postIssueToGitHub(assignment, solution, issue, userToken);
        solution.points = issue._points;

        return solution;
      })
    );

    this.solutionService.updateMany(assignment._id, result.map(solution => ({
      _id: solution._id,
      points: solution.points,
    }))).subscribe({
      next: () => this.toastService.success('Submit Feedback', `Successfully submitted feedback for ${result.length} solutions`),
      error: error => this.toastService.error('Submit Feedback', 'Failed to update solutions', error),
    });
  }
}
