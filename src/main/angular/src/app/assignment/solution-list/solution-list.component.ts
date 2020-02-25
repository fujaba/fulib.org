import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

import Assignment from '../model/assignment';
import {AssignmentService} from '../assignment.service';
import Solution from '../model/solution';
import {SolutionService} from '../solution.service';

@Component({
  selector: 'app-solution-list',
  templateUrl: './solution-list.component.html',
  styleUrls: ['./solution-list.component.scss']
})
export class SolutionListComponent implements OnInit {
  readonly searchableProperties: (keyof Solution)[] = ['name', 'studentID', 'email', 'assignee'];

  assignmentID: string;
  assignment?: Assignment;
  totalPoints?: number;
  solutions?: Solution[];
  searchText: string = '';
  filteredSolutions?: Solution[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.assignmentID = params.id;
      this.assignmentService.get(this.assignmentID).subscribe(assignment => {
        this.assignment = assignment;
        this.totalPoints = this.sumPoints(assignment.tasks);
      });
      this.solutionService.getAll(this.assignmentID).subscribe(solutions => {
        this.solutions = solutions;
        this.updateSearch();
      });
    });
  }

  totalResultPoints(solution: Solution): number {
    return this.sumPoints(solution.results);
  }

  private sumPoints(arr: {points: number}[]): number {
    return arr.reduce((acc, item) => acc + item.points, 0);
  }

  setAssignee(solution: Solution, input: HTMLInputElement): void {
    input.disabled = true;
    solution.assignment = this.assignment;
    solution.assignee = input.value;
    this.solutionService.setAssignee(solution, input.value).subscribe(() => {
      input.disabled = false;
    });
  }

  updateSearch(): void {
    const searchWords = this.searchText.split(/\s+/).map(s => s.replace('+', ' '));
    this.filteredSolutions = this.solutions.filter(solution => this.includeInSearch(solution, searchWords));
  }

  private includeInSearch(solution: Solution, searchWords: string[]): boolean {
    for (const searchWord of searchWords) {
      const colonIndex = searchWord.indexOf(':');
      if (colonIndex > 0) {
        const propertyName = searchWord.substring(0, colonIndex);
        if (!this.searchableProperties.includes(propertyName as keyof Solution)) {
          continue;
        }

        const searchValue = searchWord.substring(colonIndex + 1);
        const propertyValue = solution[propertyName] as string;
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
      const propertyValue = solution[propertyName] as string;
      if (propertyValue && propertyValue.indexOf(searchWord) >= 0) {
        return true;
      }
    }
    return false;
  }

  typeahead = (text$: Observable<string>): Observable<string[]> =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(searchInput => this.autoComplete(searchInput)),
    );

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

    const results = [];
    for (const propertyName of this.searchableProperties) {
      const propertyPrefix = propertyName + ':';
      if (propertyName.startsWith(lastWord)) {
        results.push(prefix + propertyPrefix);
      }
      else if (lastWord.startsWith(propertyPrefix)) {
        const possibleValues = this.collectAllValues(propertyName).slice(0, 10);
        results.push(...possibleValues.map(v => prefix + propertyPrefix + v.replace(' ', '+')));
      }
    }
    return results;
  }

  private collectAllValues(propertyName: string): string[] {
    const valueSet = new Set<string>();
    for (let solution of this.solutions) {
      const propertyValue = solution[propertyName] as string;
      if (propertyValue) {
        valueSet.add(propertyValue);
      }
    }
    return [...valueSet].sort();
  }
}
