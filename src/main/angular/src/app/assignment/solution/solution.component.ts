import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';

import Assignment from '../model/assignment';
import Solution from '../model/solution';
import Comment from '../model/comment';
import TaskGrading from '../model/task-grading';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit {
  @ViewChild('tokenModal', {static: true}) tokenModal;

  assignmentID: string;
  assignment?: Assignment;
  solutionID: string;
  solution?: Solution;

  gradings?: TaskGrading[];
  comments?: Comment[];

  commentName: string;
  commentEmail: string;
  commentBody: string;
  submittingComment: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, query]) => {
      this.assignmentID = params.aid;
      this.solutionID = params.sid;
      if (query.atok) {
        this.assignmentService.setToken(params.aid, query.atok);
      }
      if (query.stok) {
        this.solutionService.setToken(params.aid, params.sid, query.stok);
      }
      this.loadAssignment();
      this.loadSolution();
      this.loadComments();
      this.loadGradings();
    });
  }

  loadAssignment(): void {
    this.assignmentService.get(this.assignmentID).subscribe(assignment => {
      this.assignment = assignment;
    });
  }

  loadSolution(): void {
    this.solutionService.get(this.assignmentID, this.solutionID).subscribe(solution => {
      this.solution = solution;
      this.loadCommentDraft();
    }, error => {
      if (error.status === 401) {
        this.tokenModal.open();
      }
    });
  }

  loadComments(): void {
    this.solutionService.getComments(this.assignmentID, this.solutionID).subscribe(comments => {
      this.comments = comments;
    });
  }

  loadGradings(): void {
    this.solutionService.getGradings(this.assignmentID, this.solutionID).subscribe(gradings => {
      this.gradings = gradings;
    });
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
