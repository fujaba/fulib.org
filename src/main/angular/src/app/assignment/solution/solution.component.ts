import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable, EMPTY} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {SolutionService} from '../solution.service';
import {AssignmentService} from '../assignment.service';

import Assignment from '../model/assignment';
import Solution from '../model/solution';
import Comment from '../model/comment';
import TaskGrading from '../model/task-grading';

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

  gradings?: TaskGrading[] = [
    {
      solution: undefined,
      taskID: 1,
      timeStamp: new Date(),
      author: 'Testus',
      points: 3,
      note: 'actually better',
    },
    {
      solution: undefined,
      taskID: 4,
      timeStamp: new Date(),
      author: 'Adrian',
      points: 1,
      note: 'points off',
    },
  ];
  comments?: Comment[];

  commentName: string;
  commentEmail: string;
  commentBody: string;
  submittingComment: boolean;

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.assignmentID = params.aid;
      this.solutionID = params.sid;
      this.loadAssignment();
      this.loadSolution();
      this.loadComments();
      this.loadGradings();
    });
  }

  loadAssignment(): void {
    this.assignmentService.get(this.assignmentID).subscribe(assignment => {
      this.assignment = assignment;
      if (this.solution) {
        this.solution.assignment = assignment;
      }
    });
  }

  loadSolution(): void {
    this.solutionService.get(this.assignmentID, this.solutionID).pipe(
      catchError(err => {
        if (err.status === 401) {
          this.tokenModal.open();
          return EMPTY;
        }
        throw err;
      }),
    ).subscribe(solution => {
      this.solution = solution;
      if (this.assignment) {
        this.solution.assignment = this.assignment;
      }
      this.loadCommentDraft();
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
    this.commentName = this.solutionService.commentName;
    this.commentEmail = this.solutionService.commentEmail;
    this.commentBody = this.solutionService.getCommentDraft(this.solution);
  }

  saveCommentDraft(): void {
    this.solutionService.commentName = this.commentName;
    this.solutionService.commentEmail = this.commentEmail;
    this.solutionService.setCommentDraft(this.solution, this.commentBody);
  }

  submitComment(): void {
    this.submittingComment = true;

    this.solution.assignment = this.assignment;
    const comment: Comment = {
      parent: this.solution.id,
      author: this.commentName,
      email: this.commentEmail,
      markdown: this.commentBody,
    };
    this.solutionService.postComment(this.solution, comment).subscribe(result => {
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
    if (solutionToken) {
      this.solutionService.setToken(this.solutionID, solutionToken);
    }
    if (assignmentToken) {
      this.assignmentService.setToken(this.assignmentID, assignmentToken);
    }
    this.loadSolution();
  }
}
