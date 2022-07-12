import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from 'ng-bootstrap-ext';
import {Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {LiveList} from '../../../../shared/live/live-list';
import {UserService} from '../../../../user/user.service';
import Comment, {CommentEvent, CommentParent, CommentType} from '../../../model/comment';
import {CommentRepo} from '../../../services/comment-repo';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
})
export class CommentListComponent implements OnInit, OnDestroy {
  userId?: string;
  commentName = '';
  commentEmail = '';
  commentBody = '';
  submitting = false;

  private subscription = new Subscription();
  liveList: LiveList<CommentType>;

  constructor(
    private userService: UserService,
    private solutionService: SolutionService,
    private commentRepo: CommentRepo,
    private toastService: ToastService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(({sid}) => this.loadCommentDraft(sid));
    this.subscription.add(this.route.params.pipe(
      switchMap(({aid: assignment, sid: solution}) => (this.liveList = this.commentRepo.liveList({assignment, solution})).load()),
    ).subscribe());

    const userSub = this.userService.current$.subscribe(user => {
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
    this.subscription.add(userSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCommentDraft(solution: string): void {
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

    const {sid: solution, aid: assignment} = this.route.snapshot.params;
    const comment: Comment = {
      assignment,
      solution,
      author: this.commentName,
      email: this.commentEmail,
      body: this.commentBody,
    };
    this.commentRepo.create({assignment, solution}, comment).subscribe(result => {
      this.liveList.safeApply(result._id!, result);
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

    const {sid: solution, aid: assignment} = this.route.snapshot.params;
    this.commentRepo.delete({solution, assignment}, comment._id!).subscribe(result => {
      this.liveList.safeApply(result._id!, null);
      this.toastService.warn('Comment', 'Successfully deleted comment');
    }, error => {
      this.toastService.error('Comment', 'Failed to delete comment', error);
    });
  }
}
