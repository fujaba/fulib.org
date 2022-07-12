import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ServerSentEventSource} from '../../shared/live/event-source';
import {LiveList} from '../../shared/live/live-list';
import {HttpRepository} from '../../shared/live/repository';
import Comment, {CommentEvent, CommentParent} from '../model/comment';
import {AssignmentService} from './assignment.service';
import {SolutionService} from './solution.service';

@Injectable({
  providedIn: 'root',
})
export class CommentRepo extends HttpRepository<Comment, Pick<Comment, 'assignment' | 'solution'>> {
  constructor(
    http: HttpClient,
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
  ) {
    super(http, ({assignment, solution}, id) => {
      return `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments/${id ?? ''}`;
    });
  }

  liveList(parent: CommentParent) {
    const {assignment, solution} = parent;
    const token = this.solutionService.getToken(assignment, solution) || this.assignmentService.getToken(assignment);
    const url = this.urlBuilder(parent, `events?token=${token}`);
    return new LiveList<Comment, CommentParent, string, CommentEvent>(
      this,
      parent,
      new ServerSentEventSource<CommentEvent>(url),
      c => c._id!,
      e => ({desc: e.event, data: e.comment}),
    );
  }

  getHeaders({assignment, solution}: CommentParent, id?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    this.solutionService.addAssignmentToken(headers, assignment);
    this.solutionService.addSolutionToken(headers, assignment, solution);
    return headers;
  }
}
