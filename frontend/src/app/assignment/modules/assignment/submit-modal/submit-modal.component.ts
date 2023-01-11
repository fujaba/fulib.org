import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ModalComponent, ToastService} from 'ng-bootstrap-ext';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {UserService} from '../../../../user/user.service';
import {ReadAssignmentDto} from '../../../model/assignment';
import Solution from '../../../model/solution';
import {AssignmentService} from '../../../services/assignment.service';
import {SolutionService} from '../../../services/solution.service';
import {TelemetryService} from '../../../services/telemetry.service';
import {IssueDto, SubmitService} from '../submit.service';

@Component({
  selector: 'app-submit-modal',
  templateUrl: './submit-modal.component.html',
  styleUrls: ['./submit-modal.component.scss'],
})
export class SubmitModalComponent implements OnInit {
  assignment?: ReadAssignmentDto;
  solution?: Solution;
  issue?: IssueDto;

  mailLink?: string;
  githubToken?: string;
  draftLink?: string;

  submitting = false;

  constructor(
    public route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private telemetryService: TelemetryService,
    private solutionService: SolutionService,
    private submitService: SubmitService,
    private toastService: ToastService,
    private userService: UserService,
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
      this.submitService.createIssue(assignment, solution).then(issue => this.setIssue(issue));
    });
    this.userService.getGitHubToken().subscribe(token => this.githubToken = token);
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

    this.mailLink = `mailto:${email ?? ''}?subject=${encodedTitle}&body=${encodedBody}`;
  }

  saveAndClose(modal: ModalComponent): void {
    if (this.submitting) {
      return;
    }

    const {assignment, _id} = this.solution!;
    this.telemetryService.create(assignment, _id!, {
      action: 'submitFeedback',
      timestamp: new Date(),
    }).subscribe();

    this.submitting = true;
    this.solutionService.update(assignment, _id!, {
      points: this.issue!._points,
    }).subscribe(() => {
      this.submitting = false;
      this.toastService.success('Submit', 'Successfully saved points');
      modal.close();
    }, error => {
      this.submitting = false;
      this.toastService.error('Submit', 'Failed to save points', error);
    });
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
