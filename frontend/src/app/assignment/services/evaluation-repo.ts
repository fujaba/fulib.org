import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpRepository} from '../../shared/live/repository';
import {
  CreateEvaluationDto,
  Evaluation,
  EvaluationParent,
  FilterEvaluationParams,
  UpdateEvaluationDto,
} from '../model/evaluation';
import {SolutionService} from './solution.service';

@Injectable({
  providedIn: 'root',
})
export class EvaluationRepo extends HttpRepository<Evaluation, EvaluationParent, string, FilterEvaluationParams, CreateEvaluationDto, UpdateEvaluationDto> {
  constructor(
    http: HttpClient,
    private solutionService: SolutionService,
  ) {
    super(http, ({assignment, solution}, id) => {
      return `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id ?? ''}`;
    });
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
