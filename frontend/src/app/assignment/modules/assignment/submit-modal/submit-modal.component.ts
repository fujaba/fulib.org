import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ToastService} from '../../../../toast.service';
import Assignment from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {IssueDto, SubmitService} from '../submit.service';

@Component({
  selector: 'app-submit-modal',
  templateUrl: './submit-modal.component.html',
  styleUrls: ['./submit-modal.component.scss'],
})
export class SubmitModalComponent implements OnInit {
  assignment?: Assignment;
  solution?: Solution;
  issue?: IssueDto;

  mailLink?: string;
  githubToken?: string;
  draftLink?: string;

  constructor(
    public route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private submitService: SubmitService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, sid}) => forkJoin([
        this.assignmentService.get(aid),
        this.solutionService.get(aid, sid),
      ])),
    ).subscribe(([assignment, solution]) => {
      this.assignment = assignment;
      this.solution = solution;
      this.submitService.getGitHubToken().then(token => this.githubToken = token);
      this.submitService.createIssue(assignment, solution).then(issue => this.setIssue(issue));
    });
  }

  private setIssue(issue: IssueDto) {
    this.issue = issue;
    const {title, body} = issue;
    const encodedTitle = encodeURIComponent(title);
    const encodedBody = encodeURIComponent(body);

    const {org, prefix} = this.assignment?.classroom ?? {};
    const {email, github} = this.solution?.author ?? {};
    if (org && prefix && github) {
      this.draftLink = `https://github.com/${org}/${prefix}-${github}/issues/new?title=${encodedTitle}&body=${encodedBody}`;
    }

    if (email) {
      this.mailLink = `mailto:${email}?subject=${encodedTitle}&body=${encodedBody}`;
    }
  }

  async submitIssue() {
    try {
      const issue = await this.submitService.postIssueToGitHub(this.assignment!, this.solution!, this.issue!, this.githubToken!);
      this.toastService.success('Submit', `Successfully posted issue #${issue.number}`);
    } catch (error) {
      this.toastService.error('Submit', 'Failed to post issue', error);
    }
  }
}
