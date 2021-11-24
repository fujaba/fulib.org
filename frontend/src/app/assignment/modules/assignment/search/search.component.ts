import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import hljs from 'highlight.js/lib/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {SearchResult} from '../../../model/search-result';
import {AssignmentService} from '../../../services/assignment.service';

@Component({
  selector: 'app-assignment-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  search$ = new BehaviorSubject<string>(this.route.snapshot.queryParams.q);

  results: SearchResult[] = [];

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    combineLatest([
      this.route.params,
      this.route.queryParams,
    ]).pipe(
      switchMap(([{aid}, {q}]) => this.assignmentService.search(aid, q)),
    ).subscribe(results => {
      this.results = results;

      setTimeout(() => {
        document.querySelectorAll<HTMLElement>('pre code[lang]').forEach(el => {
          const lang = el.lang;
          if (lang && hljs.getLanguage(lang)) {
            hljs.highlightElement(el);
          }
        });
      }, 0);
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
