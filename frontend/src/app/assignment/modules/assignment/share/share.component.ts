import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {AssignmentService} from '../../../services/assignment.service';
import {ConfigService} from '../../../services/config.service';

@Component({
  selector: 'app-assignment-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  id: string;
  token?: string;

  ide = this.configService.get('ide');

  readonly origin: string;
  readonly encodedApiServer = encodeURIComponent(new URL(environment.assignmentsApiUrl, location.origin).origin);

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
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => {
      if ('token' in assignment) {
        this.token = assignment.token;
      }
    });
  }

  regenerateToken() {
    if (!confirm('Are you sure you want to generate a new token? You will need to re-send the invitation to teaching assistants.')) {
      return;
    }

    this.assignmentService.update(this.id, {token: true}).subscribe(assignment => {
      this.token = assignment.token!;
    });
  }
}
