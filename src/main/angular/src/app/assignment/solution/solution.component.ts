import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';

import Assignment from '../model/assignment';
import Solution from '../model/solution';
import Comment from '../model/comment';
import TaskGrading from '../model/task-grading';
import {combineLatest, forkJoin} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {UserService} from "../../user/user.service";

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent implements OnInit {
  @ViewChild('tokenModal', {static: true}) tokenModal;

  assignment?: Assignment;
  solution?: Solution;

  gradings?: TaskGrading[];
  comments?: Comment[];

  loggedIn = false;
  commentName: string;
  commentEmail: string;
  commentBody: string;
  submittingComment: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private users: UserService,
  ) {
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      map(([params, query]) => {
        const assignmentId = params.aid;
        if (query.atok) {
          this.assignmentService.setToken(assignmentId, query.atok);
        }
        const solutionId = params.sid;
        if (query.stok) {
          this.solutionService.setToken(assignmentId, solutionId, query.stok);
        }
        return [assignmentId, solutionId];
      }),
      switchMap(([assignmentId, solutionId]) => forkJoin([
        this.assignmentService.get(assignmentId).pipe(tap(assignment => this.assignment = assignment)),
        this.solutionService.get(assignmentId, solutionId).pipe(tap(solution => {
          this.solution = solution;
          this.loadCommentDraft();
        })),
        this.solutionService.getComments(assignmentId, solutionId).pipe(tap(comments => this.comments = comments)),
        this.solutionService.getGradings(assignmentId, solutionId).pipe(tap(gradings => this.gradings = gradings)),
      ])),
    ).subscribe(_ => {
    }, error => {
      if (error.status === 401) {
        this.tokenModal.open();
      }
    });
  }

  loadCommentDraft(): void {
    this.commentName = this.solutionService.commentName || '';
    this.commentEmail = this.solutionService.commentEmail || '';
    this.commentBody = this.solutionService.getCommentDraft(this.solution!) || '';

    // TODO unsubscribe
    this.users.current$.subscribe(user => {
      if (!user) {
        return;
      }

      this.loggedIn = true;
      if (user.firstName && user.lastName) {
        this.commentName = `${user.firstName} ${user.lastName}`;
      }
      if (user.email) {
        this.commentEmail = user.email;
      }
    });
  }

  saveCommentDraft(): void {
    this.solutionService.commentName = this.commentName;
    this.solutionService.commentEmail = this.commentEmail;
    this.solutionService.setCommentDraft(this.solution!, this.commentBody);
  }

  submitComment(): void {
    this.submittingComment = true;

    const comment: Comment = {
      parent: this.solution!.id!,
      author: this.commentName,
      email: this.commentEmail,
      markdown: this.commentBody,
    };
    this.solutionService.postComment(this.solution!, comment).subscribe(result => {
      if (!this.comments) {
        this.comments = [];
      }
      this.comments.push(result);
      this.commentBody = '';
      this.saveCommentDraft();
      this.submittingComment = false;
    });
  }

  setTokens(solutionToken: string, assignmentToken: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        atok: assignmentToken,
        stok: solutionToken,
      },
    });
  }
}
