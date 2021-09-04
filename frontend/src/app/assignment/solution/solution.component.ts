import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {combineLatest, forkJoin, Subscription} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {Marker} from '../../shared/model/marker';
import {UserService} from '../../user/user.service';
import {AssignmentService} from '../assignment.service';
import Assignment from '../model/assignment';
import Comment from '../model/comment';
import Solution from '../model/solution';
import TaskGrading from '../model/task-grading';
import {SolutionService} from '../solution.service';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent implements OnInit, OnDestroy {
  @ViewChild('tokenModal', {static: true}) tokenModal;

  assignment?: Assignment;
  solution?: Solution;
  markers: Marker[] = [];

  gradings?: TaskGrading[];
  comments: Comment[] = [];

  userId?: string;
  commentName: string;
  commentEmail: string;
  commentBody: string;
  submittingComment: boolean;

  private userSubscription: Subscription;

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
    ).subscribe(([_, solution]) => {
      // NB: this happens here instead of where the solution is loaded above, because the solution text needs to be updated first.
      // Otherwise the markers don't show up
      this.markers = this.assignmentService.lint({results: solution.results!});
    }, error => {
      if (error.status === 401) {
        this.tokenModal.open();
      }
    });

    this.userSubscription = this.users.current$.subscribe(user => {
      if (!user) {
        this.userId = undefined;
        return;
      }

      this.userId = user.id;
      if (user.firstName && user.lastName) {
        this.commentName = `${user.firstName} ${user.lastName}`;
      }
      if (user.email) {
        this.commentEmail = user.email;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  loadCommentDraft(): void {
    this.commentName = this.solutionService.commentName || '';
    this.commentEmail = this.solutionService.commentEmail || '';
    this.commentBody = this.solutionService.getCommentDraft(this.solution!) || '';
  }

  saveCommentDraft(): void {
    this.solutionService.commentName = this.commentName;
    this.solutionService.commentEmail = this.commentEmail;
    this.solutionService.setCommentDraft(this.solution!, this.commentBody);
  }

  submitComment(): void {
    this.submittingComment = true;

    const comment: Comment = {
      parent: this.solution!._id!,
      author: this.commentName,
      email: this.commentEmail,
      markdown: this.commentBody,
    };
    this.solutionService.postComment(this.solution!, comment).subscribe(result => {
      this.comments.push(result);
      this.commentBody = '';
      this.saveCommentDraft();
      this.submittingComment = false;
    });
  }

  setTokens(assignmentToken: string, solutionToken?: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        atok: assignmentToken,
        stok: solutionToken,
      },
    });
  }

  delete(comment: Comment): void {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    this.solutionService.deleteComment(this.solution!, comment).subscribe(result => {
      const index = this.comments.indexOf(comment);
      if (index >= 0) {
        this.comments[index] = result;
      }
    });
  }
}
