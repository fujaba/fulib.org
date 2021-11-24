import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {SearchResult} from '../../../model/search-result';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-assignment-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  search$ = new BehaviorSubject<string>(this.route.snapshot.queryParams.q);

  results: SearchResult[] = [];
  solutions: Record<string, Solution> = {};

  constructor(
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => this.solutionService.getAll(aid)),
    ).subscribe(solutions => {
      this.solutions = {};
      for (let solution of solutions) {
        this.solutions[solution._id!] = solution;
      }
    });

    combineLatest([
      this.route.params,
      this.route.queryParams,
    ]).pipe(
      switchMap(([{aid}, {q}]) => this.assignmentService.search(aid, q)),
    ).subscribe(results => {
      this.results = results;
    });

    this.search$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe(q => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {q},
        queryParamsHandling: 'merge',
      });
    });
  }
}
