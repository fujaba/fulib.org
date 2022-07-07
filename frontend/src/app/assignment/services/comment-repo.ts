import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpRepository} from '../../shared/live/repository';
import Comment from '../model/comment';
import {SolutionService} from './solution.service';

@Injectable({
  providedIn: 'root',
})
export class CommentRepo extends HttpRepository<Comment, Pick<Comment, 'assignment' | 'solution'>> {
  constructor(
    http: HttpClient,
    private solutionService: SolutionService,
  ) {
    super(http, ({assignment, solution}, id) => {
      return `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments/${id ?? ''}`;
    });
  }

  getHeaders({assignment, solution}: Pick<Comment, 'assignment' | 'solution'>, id?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    this.solutionService.addAssignmentToken(headers, assignment);
    this.solutionService.addSolutionToken(headers, assignment, solution);
    return headers;
  }
}
