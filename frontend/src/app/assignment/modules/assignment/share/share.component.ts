import {DOCUMENT} from '@angular/common';
import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import hljs from 'highlight.js/lib/core';
import {of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {AssignmentService} from '../../../services/assignment.service';
import {ConfigService} from '../config.service';

@Component({
  selector: 'app-assignment-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  @ViewChild('fulibFeedbackSettings') settings: ElementRef<HTMLElement>;

  id: string;
  token?: string;

  ide = this.configService.get('ide');

  readonly origin: string;
  readonly encodedApiServer = encodeURIComponent(new URL(environment.assignmentsApiUrl).origin);

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private configService: ConfigService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.origin = document.location.origin;
  }

  ngOnInit(): void {
    this.route.params.pipe(
      tap(({aid}) => this.id = aid),
      switchMap(({aid}) => {
        const token = this.assignmentService.getToken(aid);
        if (token) {
          return of(token);
        }
        return this.assignmentService.get(aid).pipe(map(a => a.token));
      }),
    ).subscribe(token => {
      this.token = token;
      setTimeout(() => hljs.highlightElement(this.settings.nativeElement));
    });
  }
}
