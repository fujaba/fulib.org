import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {ClipboardService} from 'ngx-clipboard';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import Assignment, {ReadAssignmentDto} from '../../../model/assignment';
import {AuthorInfo, authorInfoProperties, RichSolutionDto, SolutionStatus} from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {SubmitService} from '../submit.service';
import {UserService} from '../../../../user/user.service';
import {AssigneeService} from '../../../services/assignee.service';
import {HttpErrorResponse} from '@angular/common/http';

type SearchKey = keyof AuthorInfo | 'assignee' | 'status';
const searchKeys: readonly SearchKey[] = [
  'name',
  'studentId',
  'email',
  'github',
  'assignee',
  'status',
];

@Component({
  selector: 'app-solution-table',
  templateUrl: './solution-table.component.html',
  styleUrls: ['./solution-table.component.scss'],
  standalone: false,
})
export class SolutionTableComponent implements OnInit {
  readonly searchableProperties = searchKeys;
  readonly authorProperties = authorInfoProperties;

  assignment?: Assignment | ReadAssignmentDto;
  totalPoints?: number;
  solutions: RichSolutionDto[] = [];
  assigneeNames: string[] = [];
  solutionStatus = Object.values(SolutionStatus);
  selected: Partial<Record<string, boolean>> = {};

  userToken?: string;

  loading = false;
  searchError?: string;

  search$ = new BehaviorSubject<string>('');

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private assigneeService: AssigneeService,
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
      switchMap(({aid}) => this.assigneeService.findUnique(aid, 'assignee')),
    ).subscribe(assignees => {
      this.assigneeNames = assignees.sort();
    });

    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]).pipe(
      tap(() => this.loading = true),
      tap(([, {q}]) => this.search$.next(q)),
      switchMap(([{aid}, {q}]) => this.solutionService.getAll(aid, q).pipe(catchError((error: HttpErrorResponse) => of(error)))),
    ).subscribe(solutionsOrError => {
      this.loading = false;
      if (Array.isArray(solutionsOrError)) {
        this.solutions = solutionsOrError;
        this.searchError = undefined;
      } else {
        this.searchError = solutionsOrError.error.message;
      }
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
    if (key === 'status') {
      return ['todo', 'code-search', 'started', 'graded'];
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
    this.copy('Assignees', s => s.assignee ?? '');
  }

  copyAuthor(name: string, key: keyof AuthorInfo) {
    this.copy(name, s => s.author[key] ?? '');
  }

  copy(name: string, select: (s: RichSolutionDto) => string) {
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
        solution.status = SolutionStatus.graded;
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

  assignAll(assignee: string) {
    const ids = Object.keys(this.selected);
    this.assigneeService.updateMany(this.assignment!._id!, ids.map(id => ({
      solution: id,
      assignee,
    }))).subscribe({
      next: () => {
        this.toastService.success('Assign Solutions', `Successfully assigned ${ids.length} solutions`);
        for (const solution of this.solutions) {
          if (ids.includes(solution._id!)) {
            solution.assignee = assignee;
          }
        }
      },
      error: error => this.toastService.error('Assign Solutions', 'Failed to assign solutions', error),
    });
  }

  toggleSearch(criteria: string, value: string) {
    const oldSearch = this.search$.value ?? '';
    const newSearch = toggleSearchTerm(oldSearch, criteria, value);
    this.search$.next(newSearch);
  }

  hasSearch(criteria: string, value: string) {
    return this.search$.value?.includes(criteria + ':' + value.replace(/ /g, '+'));
  }
}

function toggleSearchTerm(search: string, criteria: string, value: string): string {
  value = value.replace(/ /g, '+');
  const prefix = criteria + ':';
  const newTerm = criteria + ':' + value;

  // fast path: search is empty
  if (!search) {
    return newTerm;
  }

  const searchTerms = search.split(' ');
  const oldIndex = searchTerms.findIndex(term => term.startsWith(prefix));
  if (oldIndex < 0) {
    // add new search term
    searchTerms.push(newTerm);
  } else if (searchTerms[oldIndex] === newTerm) {
    // remove old search term ("toggle off")
    searchTerms.splice(oldIndex, 1);
  } else {
    // replace old search term
    searchTerms[oldIndex] = newTerm;
  }
  return searchTerms.join(' ');
}
