import {DOCUMENT} from '@angular/common';
import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import hljs from 'highlight.js/lib/core';
import {of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {SolutionService} from 'src/app/assignment/services/solution.service';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-solution-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class SolutionShareComponent implements OnInit {
  @ViewChild('fulibFeedbackSettings') settings: ElementRef<HTMLElement>;

  assignmentId: string;
  solutionId: string;
  token?: string;

  readonly origin: string;
  readonly encodedApiServer = encodeURIComponent(new URL(environment.assignmentsApiUrl).origin);

  constructor(
    private solutionService: SolutionService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit(): void {
    this.route.params.pipe(
      tap(({aid, sid}) => {
        this.assignmentId = aid;
        this.solutionId = sid;
      }),
      switchMap(({aid, sid}) => {
        const token = this.solutionService.getToken(aid, sid);
        if (token) {
          return of(token);
        }
        return this.solutionService.get(aid, sid).pipe(map(s => s.token));
      }),
    ).subscribe(token => {
      this.token = token;
      setTimeout(() => hljs.highlightElement(this.settings.nativeElement));
    });
  }
}
