import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ServerSentEventSource} from '../../shared/live/event-source';
import {HttpRepository} from '../../shared/live/repository';
import {
  Evaluation,
  EvaluationEvent,
  EvaluationParent,
  EvaluationType,
  FilterEvaluationParams,
} from '../model/evaluation';
import {AssignmentService} from './assignment.service';
import {SolutionService} from './solution.service';

@Injectable({
  providedIn: 'root',
})
export class EvaluationRepo extends HttpRepository<EvaluationType> {
  constructor(
    http: HttpClient,
    private solutionService: SolutionService,
    private assignmentService: AssignmentService,
  ) {
    super(http, ({assignment, solution}, id) => {
      return `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id ?? ''}`;
    });
  }

  stream({assignment, solution}: EvaluationParent): Observable<EvaluationEvent> {
    const token = this.assignmentService.getToken(assignment);
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/events?token=${token}`;
    return new ServerSentEventSource<EvaluationEvent>(url).listen();
  }

  unique<K extends keyof Evaluation | string, T = K extends keyof Evaluation ? Evaluation[K] : unknown>(assignment: string, field: K, params: FilterEvaluationParams = {}): Observable<T[]> {
    const headers: Record<string, string> = {};
    this.solutionService.addAssignmentToken(headers, assignment);
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/evaluations/unique/${field}`;
    return this.http.get<T[]>(url, {headers, params: params as any});
  }

  findInAssignment(assignment: string, id: string): Observable<Evaluation> {
    const headers: Record<string, string> = {};
    this.solutionService.addAssignmentToken(headers, assignment);
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/evaluations/${id}`;
    return this.http.get<Evaluation>(url, {headers});
  }

  getHeaders({assignment, solution}: EvaluationParent, id?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    this.solutionService.addAssignmentToken(headers, assignment);
    this.solutionService.addSolutionToken(headers, assignment, solution);
    return headers;
  }
}
