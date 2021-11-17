import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {AssignmentService} from '../../../services/assignment.service';

@Component({
  selector: 'app-assignment-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  id: string;
  token?: string;

  readonly origin: string;

  constructor(
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
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
    });
  }
}
