import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {
  CreateEvaluationDto,
  Evaluation,
  FilterEvaluationParams,
  RemarkDto,
  UpdateEvaluationDto
} from "../model/evaluation";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {observeSSE} from "./sse-helper";
import {map} from "rxjs/operators";
import {TokenService} from "./token.service";

@Injectable()
export class EvaluationService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {
  }

  findAll(assignment: string, solution?: string, params: FilterEvaluationParams = {}): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/${solution ? `solutions/${solution}/` : ''}evaluations`, {params: params as any});
  }

  distinctValues<T>(assignment: string, field: keyof Evaluation | string, params: FilterEvaluationParams = {}): Observable<T[]> {
    return this.http.get<T[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/evaluations/unique/${field}`, {params: params as any});
  }

  distinctRemarks(assignment: string, params: FilterEvaluationParams = {}): Observable<RemarkDto[]> {
    return this.http.get<RemarkDto[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/evaluations/remarks`, {params: params as any});
  }

  stream(assignment: string, solution: string): Observable<{ event: string, evaluation: Evaluation }> {
    const token = this.tokenService.getAssignmentToken(assignment);
    return observeSSE<Evaluation, 'evaluation'>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/events?token=${token}`);
  }

  findByTask(assignent: string, solution: string, task: string): Observable<Evaluation | undefined> {
    return this.findAll(assignent, solution, {task}).pipe(map(([first]) => first));
  }

  findOne(assignment: string, solution: string | undefined, evaluation: string): Observable<Evaluation> {
    // NB: The findOne endpoint does not really care about the solution, so we can just use * if unknown.
    return this.http.get<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution ?? '*'}/evaluations/${evaluation}`);
  }

  create(assignment: string, solution: string, dto: CreateEvaluationDto): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations`, dto);
  }

  update(assignment: string, solution: string, id: string, dto: UpdateEvaluationDto): Observable<Evaluation> {
    return this.http.patch<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id}`, dto);
  }

  delete(assignment: string, solution: string, id: string): Observable<Evaluation> {
    return this.http.delete<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id}`);
  }
}
