import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, forkJoin, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {ToastService} from '../../../../toast.service';
import {Assignee} from '../../../model/assignee';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-solution-table',
  templateUrl: './solution-table.component.html',
  styleUrls: ['./solution-table.component.scss'],
})
export class SolutionTableComponent implements OnInit {
  readonly searchableProperties: string[] = ['name', 'studentID', 'email', 'assignee', 'github'];

  assignment?: Assignment;
  totalPoints?: number;
  solutions?: Solution[];
  assignees?: Record<string, Assignee>;

  searchText = '';
  filteredSolutions?: Solution[];

  constructor(
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]).pipe(
      map(([params, query]) => {
        if (query.q) {
          this.searchText = query.q;
        }
        return params.aid;
      }),
      distinctUntilChanged(),
      switchMap(assignmentId => forkJoin([
        this.assignmentService.get(assignmentId).pipe(tap(assignment => {
          this.assignment = assignment;
          this.totalPoints = assignment.tasks.reduce((a, c) => c.points > 0 ? a + c.points : a, 0);
        })),
        this.solutionService.getAll(assignmentId).pipe(tap(solutions => {
          this.solutions = solutions;
          this.updateSearch();
        })),
        this.solutionService.getAssignees(assignmentId).pipe(tap(assignees => {
          this.assignees = {};
          for (let assignee of assignees) {
            this.assignees[assignee.solution] = assignee;
          }
        })),
      ])),
    ).subscribe();
  }

  setAssignee(solution: Solution, input: HTMLInputElement): void {
    input.disabled = true;
    const assignee = this.assignees?.[solution._id!];
    if (assignee) {
      assignee.assignee = input.value;
    }
    this.solutionService.setAssignee(solution, input.value).subscribe(() => {
      input.disabled = false;
      this.toastService.success('Assignee', input.value ? `Successfully assigned to ${input.value}` : 'Successfully de-assigned');
    }, error => {
      input.disabled = false;
      this.toastService.error('Assignee', 'Failed to assign', error);
    });
  }

  updateSearch(): void {
    const searchText = this.searchText.trim();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {q: searchText},
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    if (!searchText) {
      this.filteredSolutions = this.solutions;
      return;
    }

    const searchWords = searchText.split(/\s+/).map(s => s.replace(/\+/g, ' '));
    this.filteredSolutions = this.solutions!.filter(solution => this.includeInSearch(solution, searchWords));
  }

  private includeInSearch(solution: Solution, searchWords: string[]): boolean {
    for (const searchWord of searchWords) {
      const colonIndex = searchWord.indexOf(':');
      if (colonIndex > 0) {
        const propertyName = searchWord.substring(0, colonIndex);
        if (!this.searchableProperties.includes(propertyName)) {
          continue;
        }

        const searchValue = searchWord.substring(colonIndex + 1);
        const propertyValue = this.getProperty(solution, propertyName);
        if (!propertyValue || propertyValue.indexOf(searchValue) < 0) {
          return false;
        }
        continue;
      }

      if (!this.hasAnyPropertyWithValue(solution, searchWord)) {
        return false;
      }
    }
    return true;
  }

  private hasAnyPropertyWithValue(solution: Solution, searchWord: string): boolean {
    for (const propertyName of this.searchableProperties) {
      const propertyValue = this.getProperty(solution, propertyName);
      if (propertyValue && propertyValue.indexOf(searchWord) >= 0) {
        return true;
      }
    }
    return false;
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
}
