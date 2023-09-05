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
import {CONFIG_OPTIONS, ConfigKey, ConfigService} from '../../../services/config.service';
import {SolutionContainerService} from '../../../services/solution-container.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {TelemetryService} from '../../../services/telemetry.service';

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
  assignees: Partial<Record<string, Assignee>> = {};
  assigneeNames: string[] = [];
  evaluated: Partial<Record<string, boolean>> = {};
  selected: Partial<Record<string, boolean>> = {};

  loading = false;

  optionItems = CONFIG_OPTIONS.filter(o => o.options);
  options = this.configService.getAll();

  search$ = new BehaviorSubject<string>('');

  solutionId: TrackByFunction<Solution> = (index, s) => s._id;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private solutionContainerService: SolutionContainerService,
    private configService: ConfigService,
    private router: Router,
    private telemetryService: TelemetryService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private taskService: TaskService,
    private clipboardService: ClipboardService,
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
      switchMap(({aid}) => this.solutionService.getAssignees(aid)),
    ).subscribe(assignees => {
      this.assignees = {};
      const names = new Set<string>();
      for (let assignee of assignees) {
        names.add(assignee.assignee);
        this.assignees[assignee.solution] = assignee;
      }
      this.assigneeNames = [...names].sort();
    });

    this.activatedRoute.params.pipe(
      switchMap(({aid}) => forkJoin([
        this.solutionService.getEvaluationValues<string>(aid, 'solution', {codeSearch: false}),
        this.solutionService.getEvaluationValues<string>(aid, 'solution', {codeSearch: true}),
      ])),
    ).subscribe(([manual, codeSearch]) => {
      this.evaluated = {};
      for (let id of codeSearch) {
        this.evaluated[id] = false;
      }
      for (let id of manual) {
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
  }

  setOption(key: ConfigKey, value: string) {
    // copy is necessary to re-evaluate link pipes
    this.options = {...this.options, [key]: value};
    this.configService.set(key, value);
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

  telemetry(solution: Solution, action: string) {
    this.telemetryService.create(solution.assignment, solution._id!, {
      action,
      timestamp: new Date(),
    }).subscribe();
  }

  copyPoints() {
    this.clipboardService.copy(this.solutions!.map(s => s.points ?? '').join('\n'));
    this.toastService.success('Copy Points', `Copied ${this.solutions.length} rows to clipboard`);
  }

  copyAuthor(name: string, key: keyof AuthorInfo) {
    this.clipboardService.copy(this.solutions!.map(s => s.author[key] ?? '').join('\n'));
    this.toastService.success(`Copy ${name}`, `Copied ${this.solutions.length} rows to clipboard`);
  }

  launch(solution: Solution, elem: HTMLButtonElement) {
    if (!this.assignment || !('token' in this.assignment)) {
      return;
    }

    elem.disabled = true;
    this.solutionContainerService.launch(this.assignment, solution).subscribe(container => {
      elem.disabled = false;
      open(container.url, '_blank');
    }, error => {
      elem.disabled = false;
      this.toastService.error('Launch in Projects', 'Failed to launch in Projects', error);
    });
  }
}
