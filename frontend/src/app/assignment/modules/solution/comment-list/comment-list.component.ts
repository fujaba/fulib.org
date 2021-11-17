import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ToastService} from '../../../../toast.service';
import {UserService} from '../../../../user/user.service';
import Comment from '../../../model/comment';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
})
export class CommentListComponent implements OnInit, OnDestroy {
  comments: Comment[] = [];

  userId?: string;
  commentName: string;
  commentEmail: string;
  commentBody: string;
  submitting: boolean;

  private userSubscription: Subscription;

  constructor(
    private userService: UserService,
    private solutionService: SolutionService,
    private toastService: ToastService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => this.solutionService.getComments(aid, sid)),
    ).subscribe(comments => {
      this.comments = comments;
      this.loadCommentDraft();
    });

    this.userSubscription = this.userService.current$.subscribe(user => {
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
    const solution = this.route.snapshot.params.sid;
    this.commentName = this.solutionService.commentName || '';
    this.commentEmail = this.solutionService.commentEmail || '';
    this.commentBody = this.solutionService.getCommentDraft(solution) || '';
  }

  saveCommentDraft(): void {
    const solution = this.route.snapshot.params.sid;
    this.solutionService.commentName = this.commentName;
    this.solutionService.commentEmail = this.commentEmail;
    this.solutionService.setCommentDraft(solution, this.commentBody);
  }

  submitComment(): void {
    this.submitting = true;

    const {sid, aid} = this.route.snapshot.params;
    const comment: Comment = {
      assignment: aid,
      solution: sid,
      author: this.commentName,
      email: this.commentEmail,
      body: this.commentBody,
    };
    this.solutionService.postComment(aid, sid, comment).subscribe(result => {
      this.comments.push(result);
      this.commentBody = '';
      this.saveCommentDraft();
      this.submitting = false;
    }, error => {
      this.submitting = false;
      this.toastService.error('Comment', 'Failed to post comment', error);
    });
  }

  delete(comment: Comment): void {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    const {sid, aid} = this.route.snapshot.params;
    this.solutionService.deleteComment(aid, sid, comment._id!).subscribe(() => {
      const index = this.comments.indexOf(comment);
      if (index >= 0) {
        this.comments.splice(index, 1);
      }
      this.toastService.warn('Comment', 'Successfully deleted comment');
    }, error => {
      this.toastService.error('Comment', 'Failed to delete comment', error);
    });
  }
}
