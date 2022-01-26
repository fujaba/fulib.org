import {Component, OnInit, TrackByFunction} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, combineLatest, forkJoin} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import Assignment from '../../../model/assignment';
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
  glob$ = new BehaviorSubject<string>(this.route.snapshot.queryParams.glob);

  results: SearchResult[] = [];
  assignment?: Assignment;
  solutions: Record<string, Solution> = {};

  trackResult: TrackByFunction<SearchResult> = (index, result) => result.solution;
  trackSnippet: TrackByFunction<Snippet> = (index, snippet) => snippet.code;

  constructor(
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid}) => forkJoin([
        this.assignmentService.get(aid),
        this.solutionService.getAll(aid),
      ])),
    ).subscribe(([assignment, solutions]) => {
      this.assignment = assignment;
      this.solutions = {};
      for (let solution of solutions) {
        this.solutions[solution._id!] = solution;
      }
    });

    combineLatest([
      this.route.params,
      this.route.queryParams,
    ]).pipe(
      switchMap(([{aid}, {q, glob}]) => this.assignmentService.search(aid, q, 2, glob)),
    ).subscribe(results => {
      this.results = results;
    });

    combineLatest([
      this.search$.pipe(debounceTime(200), distinctUntilChanged()),
      this.glob$.pipe(debounceTime(200), distinctUntilChanged()),
    ]).subscribe(([q, glob]) => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {q, glob},
        queryParamsHandling: 'merge',
      });
    });
  }
}
