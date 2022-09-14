import {Component, OnInit, TrackByFunction} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {BehaviorSubject, combineLatest, forkJoin, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Assignee} from '../../../model/assignee';
import Assignment from '../../../model/assignment';
import Solution, {AuthorInfo} from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {CONFIG_OPTIONS, ConfigKey, ConfigService} from '../../../services/config.service';
import {SolutionService} from '../../../services/solution.service';
import {TaskService} from '../../../services/task.service';
import {TelemetryService} from '../../../services/telemetry.service';

@Component({
  selector: 'app-solution-table',
  templateUrl: './solution-table.component.html',
  styleUrls: ['./solution-table.component.scss'],
})
export class SolutionTableComponent implements OnInit {
  readonly searchableProperties: readonly (keyof AuthorInfo | 'assignee')[] = [
    'name',
    'studentId',
    'email',
    'github',
    'assignee',
  ];

  assignment?: Assignment;
  totalPoints?: number;
  solutions: Solution[] = [];
  assignees?: Record<string, Assignee>;
  evaluated: Record<string, boolean> = {};

  loading = false;

  optionItems = CONFIG_OPTIONS.filter(o => o.options);
  options = this.configService.getAll();

  search$ = new BehaviorSubject<string>('');

  solutionId: TrackByFunction<Solution> = (index, s) => s._id;

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private configService: ConfigService,
    private router: Router,
    private telemetryService: TelemetryService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private taskService: TaskService,
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
      for (let assignee of assignees) {
        this.assignees[assignee.solution] = assignee;
      }
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
    this.options[key] = value;
    this.configService.set(key, value);
  }

  setAssignee(solution: Solution, input: HTMLInputElement): void {
    input.disabled = true;
    this.solutionService.setAssignee(solution, input.value).subscribe(result => {
      if (this.assignees) {
        this.assignees[solution._id!] = result;
      }
      input.disabled = false;
      this.toastService.success('Assignee', input.value ? `Successfully assigned to ${input.value}` : 'Successfully de-assigned');
    }, error => {
      input.disabled = false;
      this.toastService.error('Assignee', 'Failed to assign', error);
    });
  }

  private getProperty(solution: Solution, property: string): string | undefined {
    if (property === 'assignee') {
      return this.assignees?.[solution._id!]?.assignee;
    }
    if (typeof solution.author[property] === 'string') {
      return solution.author[property];
    }
    return undefined;
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

  assigneeTypeahead = (text$: Observable<string>): Observable<string[]> => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(searchInput => {
        const assignees = this.collectAllValues('assignee');
        return assignees.filter(a => a.startsWith(searchInput)).slice(0, 10);
      }),
    );
  };


  private collectAllValues(propertyName: string): string[] {
    const valueSet = new Set<string>();
    for (const solution of this.solutions!) {
      const propertyValue = this.getProperty(solution, propertyName);
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
}
