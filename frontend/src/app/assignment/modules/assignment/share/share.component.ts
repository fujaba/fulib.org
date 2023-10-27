import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {AssignmentService} from '../../../services/assignment.service';
import Assignment, {ReadAssignmentDto} from "../../../model/assignment";

@Component({
  selector: 'app-assignment-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnInit {
  assignment?: Assignment | ReadAssignmentDto;

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
      switchMap(({aid}) => this.assignmentService.get(aid)),
    ).subscribe(assignment => {
      this.assignment = assignment;
    });
  }

  regenerateToken() {
    if (!confirm('Are you sure you want to generate a new token? You will need to re-send the invitation to teaching assistants.')) {
      return;
    }

    this.assignmentService.update(this.assignment!._id, {token: true}).subscribe(assignment => {
      this.assignment = assignment;
    });
  }

  protected readonly switchMap = switchMap;
}
