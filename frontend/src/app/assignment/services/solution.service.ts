import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Params} from '@angular/router';
import {forkJoin, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {StorageService} from '../../services/storage.service';
import {UserService} from '../../user/user.service';
import {Assignee} from '../model/assignee';
import {ReadAssignmentDto} from '../model/assignment';
import {CheckResult, CheckSolution} from '../model/check';
import Comment from '../model/comment';
import {
  CreateEvaluationDto,
  Evaluation,
  FilterEvaluationParams,
  RemarkDto,
  Snippet,
  UpdateEvaluationDto,
} from '../model/evaluation';

import Solution, {AuthorInfo, EstimatedCosts, ImportSolution} from '../model/solution';
import {AssignmentService} from './assignment.service';
import {observeSSE} from './sse-helper';

@Injectable()
export class SolutionService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private assignmentService: AssignmentService,
    private users: UserService,
  ) {
  }

  // --------------- Solution Drafts ---------------

  getAuthor(): AuthorInfo | undefined {
    const json = this.storageService.get('solutionAuthor');
    return json ? JSON.parse(json) : undefined;
  }

  setAuthor(value: AuthorInfo) {
    this.storageService.set('solutionAuthor', JSON.stringify(value));
  }

  getDraft(assignment: string): string | null {
    return this.storageService.get(`solutionDraft/${assignment}`);
  }

  setDraft(assignment: string, solution: string | null): void {
    this.storageService.set(`solutionDraft/${assignment}`, solution);
  }

  // --------------- Comment Drafts ---------------

  getCommentDraft(solution: string): string | null {
    return this.storageService.get(`commentDraft/${solution}`);
  }

  setCommentDraft(solution: string, draft: string | null) {
    this.storageService.set(`commentDraft/${solution}`, draft);
  }

  // --------------- Tokens ---------------

  getToken(assignment: string, id: string): string | null {
    return this.storageService.get(`solutionToken/${assignment}/${id}`);
  }

  setToken(assignment: string, id: string, token: string | null): void {
    this.storageService.set(`solutionToken/${assignment}/${id}`, token);
  }

  getOwnIds(assignment?: string): { assignment: string, id: string }[] {
    const pattern = /^solutionToken\/(.*)\/(.*)$/;
    const ids: { assignment: string, id: string; }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      const match = pattern.exec(key);
      if (!match) {
        continue;
      }

      const matchedAssignmentID = match[1] as string;
      if (assignment && matchedAssignmentID !== assignment) {
        continue;
      }

      const id = match[2] as string;
      ids.push({assignment: matchedAssignmentID, id});
    }

    return ids;
  }

  getOwnWithAssignments(): Observable<[ReadAssignmentDto[], Solution[]]> {
    return this.users.getCurrent().pipe(
      switchMap(user => {
        if (user && user.id) {
          return this.getOwn().pipe(switchMap(solutions => {
            const assignmentIds = [...new Set<string>(solutions.map(s => s.assignment))];
            const assignments = this.assignmentService.findAll(assignmentIds);

            return forkJoin([assignments, of(solutions)]);
          }));
        } else {
          const compoundIds = this.getOwnIds();
          const assignmentIds = [...new Set<string>(compoundIds.map(id => id.assignment))];
          const assignments = this.assignmentService.findAll(assignmentIds);
          const solutions = forkJoin(compoundIds.map(cid => this.get(cid.assignment, cid.id)));

          return forkJoin([assignments, solutions]);
        }
      }),
    );
  }

  // --------------- HTTP Methods ---------------

  check(solution: CheckSolution): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.assignmentsApiUrl}/assignments/${solution.assignment._id}/check`, solution);
  }

  submit(solution: Solution): Observable<Solution> {
    return this.http.post<Solution>(`${environment.assignmentsApiUrl}/assignments/${solution.assignment}/solutions`, solution).pipe(
      tap(response => this.setToken(solution.assignment, response._id!, response.token!)),
    );
  }

  previewImport(assignment: string): Observable<ImportSolution[]> {
    return this.http.get<ImportSolution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/import`);
  }

  import(assignment: string, files?: File[], usernames?: string[]): Observable<ImportSolution[]> {
    let body;
    if (files && files.length) {
      const data = new FormData();
      for (let file of files) {
        data.append('files', file, file.name);
      }
      body = data;
    }
    return this.http.post<ImportSolution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/import`, body, {
      params: usernames ? {usernames} : undefined,
    });
  }

  importEmbeddings(assignment: string, estimate?: boolean): Observable<EstimatedCosts> {
    return this.http.post<EstimatedCosts>(`${environment.assignmentsApiUrl}/assignments/${assignment}/embeddings`, {}, {
      params: estimate ? {estimate} : undefined,
    });
  }

  get(assignment: string, id: string): Observable<Solution> {
    return this.http.get<Solution>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${id}`);
  }

  getAll(assignment: string, search?: string): Observable<Solution[]> {
    const params: Params = {};
    search && (params.q = search);
    return this.http.get<Solution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions`, {
      params,
    });
  }

  getOwn(): Observable<Solution[]> {
    return this.http.get<Solution[]>(`${environment.assignmentsApiUrl}/solutions`);
  }

  update(assignment: string, solution: string, dto: Partial<Solution>): Observable<Solution> {
    return this.http.patch<Solution>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}`, dto);
  }

  updateMany(assignment: string, dtos: Partial<Solution>[]): Observable<ImportSolution[]> {
    return this.http.patch<ImportSolution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions`, dtos);
  }

  delete(assignment: string, solution: string): Observable<Solution> {
    return this.http.delete<Solution>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}`);
  }

  deleteAll(assignment: string, solutions: string[]): Observable<Solution> {
    return this.http.delete<Solution>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions`, {params: {ids: solutions}});
  }

  getComments(assignment: string, solution: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments`);
  }

  postComment(assignment: string, solution: string, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments`, comment);
  }

  deleteComment(assignment: string, solution: string, comment: string): Observable<Comment> {
    return this.http.delete<Comment>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments/${comment}`);
  }

  streamComments(assignment: string, solution: string): Observable<{ event: string, comment: Comment }> {
    const token = this.getToken(assignment, solution) || this.assignmentService.getToken(assignment);
    return observeSSE<Comment, 'comment'>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments/events?token=${token}`);
  }

  getEvaluations(assignment: string, id?: string, params: FilterEvaluationParams = {}): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/${id ? `solutions/${id}/` : ''}evaluations`, {params: params as any});
  }

  getEvaluationValues<T>(assignment: string, field: keyof Evaluation | string, params: FilterEvaluationParams = {}): Observable<T[]> {
    return this.http.get<T[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/evaluations/unique/${field}`, {params: params as any});
  }

  getEvaluationRemarks(assignment: string, params: FilterEvaluationParams = {}): Observable<RemarkDto[]> {
    return this.http.get<RemarkDto[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/evaluations/remarks`, {params: params as any});
  }

  streamEvaluations(assignment: string, solution: string): Observable<{ event: string, evaluation: Evaluation }> {
    const token = this.assignmentService.getToken(assignment);
    return observeSSE<Evaluation, 'evaluation'>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/events?token=${token}`);
  }

  getEvaluationByTask(assignent: string, solution: string, task: string): Observable<Evaluation | undefined> {
    return this.getEvaluations(assignent, solution, {task}).pipe(map(([first]) => first));
  }

  getEvaluation(assignment: string, solution: string | undefined, evaluation: string): Observable<Evaluation> {
    // NB: The findOne endpoint does not really care about the solution, so we can just use * if unknown.
    return this.http.get<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/${solution || '*'}/evaluations/${evaluation}`);
  }

  createEvaluation(assignment: string, solution: string, dto: CreateEvaluationDto): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations`, dto);
  }

  updateEvaluation(assignment: string, solution: string, id: string, dto: UpdateEvaluationDto): Observable<Evaluation> {
    return this.http.patch<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id}`, dto);
  }

  deleteEvaluation(assignment: string, solution: string, id: string): Observable<Evaluation> {
    return this.http.delete<Evaluation>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id}`);
  }

  getAssignees(assignment: string): Observable<Assignee[]> {
    return this.http.get<Assignee[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/assignees`);
  }

  setAssignee(assignment: string, solution: string, assignee: string | undefined): Observable<Assignee> {
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/assignee`;
    return assignee ? this.http.put<Assignee>(url, {assignee}) : this.http.delete<Assignee>(url);
  }

  getEmbeddingSnippets(assignment: string, solution: string, task: string): Observable<Snippet[]> {
    return this.http.get<any[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/embeddings`, {
      params: {
        solution,
        task
      }
    }).pipe(
      map(embeddings => embeddings.map(emb => this.convertEmbeddable(emb))),
    );
  }

  private convertEmbeddable({file, line, text, _score}): Snippet {
    return {
      file,
      from: {line, character: 0},
      to: {line: line + text.split('\n').length - 2, character: 0},
      comment: '',
      score: _score,
      code: text.substring(text.indexOf('\n') + 2),
    };
  }

  getSimilarEmbeddingSnippets(assignment: string, solution: string, snippet: Snippet): Observable<(Snippet & {
    solution: string
  })[]> {
    const id = `${solution}-${snippet.file}-${snippet.from.line}`;
    return this.http.get<any[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/embeddings`, {params: {id}}).pipe(
      map(embeddings => embeddings.map(emb => ({
        ...this.convertEmbeddable(emb),
        solution: emb.solution,
      }))),
    );
  }
}
