import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {SolutionService} from 'src/app/assignment/services/solution.service';
import {environment} from '../../../../../environments/environment';
import {CONFIG_OPTIONS, ConfigService} from '../../../services/config.service';

@Component({
  selector: 'app-solution-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class SolutionShareComponent implements OnInit {
  assignmentId: string;
  solutionId: string;
  token?: string;
  ide = this.configService.get('ide');

  readonly origin: string;
  readonly encodedApiServer = encodeURIComponent(new URL(environment.assignmentsApiUrl, location.origin).origin);
  readonly ideOption = CONFIG_OPTIONS.find(o => o.key === 'ide')!;

  constructor(
    private solutionService: SolutionService,
    private configService: ConfigService,
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
    });
  }

  saveIde(value: string) {
    this.configService.set('ide', value);
  }
}
