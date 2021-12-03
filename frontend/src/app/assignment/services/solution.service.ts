import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Params} from '@angular/router';
import {forkJoin, Observable, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {StorageService} from '../../storage.service';
import {UserService} from '../../user/user.service';
import {AssignmentService} from './assignment.service';
import {Assignee} from '../model/assignee';
import Assignment from '../model/assignment';
import {CheckResult, CheckSolution} from '../model/check';
import Comment from '../model/comment';
import {CreateEvaluationDto, Evaluation, UpdateEvaluationDto} from '../model/evaluation';

import Solution, {AuthorInfo} from '../model/solution';

function asID(id: { _id?: string, id?: string } | string): string {
  return typeof id === 'string' ? id : id._id! || id.id!;
}

@Injectable({
  providedIn: 'root',
})
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

  getDraft(assignment: Assignment): string | null {
    return this.storageService.get(`solutionDraft/${assignment._id}`);
  }

  setDraft(assignment: Assignment, solution: string | null): void {
    this.storageService.set(`solutionDraft/${assignment._id}`, solution);
  }

  // --------------- Comment Drafts ---------------

  get commentName(): string | null {
    return this.storageService.get('commentName');
  }

  set commentName(value: string | null) {
    this.storageService.set('commentName', value);
  }

  get commentEmail(): string | null {
    return this.storageService.get('commentEmail');
  }

  set commentEmail(value: string | null) {
    this.storageService.set('commentEmail', value);
  }

  getCommentDraft(solution: Solution | string): string | null {
    const solutionID = asID(solution);
    return this.storageService.get(`commentDraft/${solutionID}`);
  }

  setCommentDraft(solution: Solution | string, draft: string | null) {
    const solutionID = asID(solution);
    this.storageService.set(`commentDraft/${solutionID}`, draft);
  }

  // --------------- Tokens ---------------

  getToken(assignment: Assignment | string, id: string): string | null {
    const assignmentID = asID(assignment);
    return this.storageService.get(`solutionToken/${assignmentID}/${id}`);
  }

  setToken(assignment: Assignment | string, id: string, token: string | null): void {
    const assignmentID = asID(assignment);
    this.storageService.set(`solutionToken/${assignmentID}/${id}`, token);
  }

  getOwnIds(assignment?: Assignment | string): { assignment: string, id: string }[] {
    const assignmentID = assignment ? asID(assignment) : null;

    const pattern = /^solutionToken\/(.*)\/(.*)$/;
    const ids: { assignment: string, id: string; }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      const match = pattern.exec(key);
      if (!match) {
        continue;
      }

      const matchedAssignmentID = match[1] as string;
      if (assignmentID && matchedAssignmentID !== assignmentID) {
        continue;
      }

      const id = match[2] as string;
      ids.push({assignment: matchedAssignmentID, id});
    }

    return ids;
  }

  getOwnWithAssignments(): Observable<[Assignment[], Solution[]]> {
    return this.users.current$.pipe(
      switchMap(user => {
        if (user && user.id) {
          return this.getOwn().pipe(switchMap(solutions => {
            const assignmentIds = [...new Set<string>(solutions.map(s => s.assignment))];
            const assignments = forkJoin(assignmentIds.map(aid => this.assignmentService.get(aid)));

            return forkJoin([assignments, of(solutions)]);
          }));
        } else {
          const compoundIds = this.getOwnIds();
          const assignmentIds = [...new Set<string>(compoundIds.map(id => id.assignment))];

          const assignments = forkJoin(assignmentIds.map(aid => this.assignmentService.get(aid)));
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

  import(assignment: string): Observable<Solution[]> {
    const headers = {};
    this.addAssignmentToken(headers, assignment);
    return this.http.post<Solution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/import`, {}, {headers});
  }

  get(assignment: Assignment | string, id: string): Observable<Solution> {
    const assignmentID = asID(assignment);
    const headers = {};
    this.addSolutionToken(headers, assignmentID, id);
    this.addAssignmentToken(headers, assignmentID);
    return this.http.get<Solution>(`${environment.assignmentsApiUrl}/assignments/${assignmentID}/solutions/${id}`, {headers});
  }

  getAll(assignment: string, search?: string): Observable<Solution[]> {
    const headers = {};
    this.addAssignmentToken(headers, assignment);
    const params: Params = {};
    search && (params.q = search);
    return this.http.get<Solution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions`, {headers, params});
  }

  getOwn(): Observable<Solution[]> {
    return this.http.get<Solution[]>(`${environment.assignmentsApiUrl}/solutions`);
  }

  update(assignment: string, solution: string, dto: Partial<Solution>): Observable<Solution> {
    const headers = {};
    this.addSolutionToken(headers, assignment, solution);
    this.addAssignmentToken(headers, assignment);
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}`;
    return this.http.patch<Solution>(url, dto, {headers});
  }

  getComments(assignment: string, solution: string): Observable<Comment[]> {
    const headers = {};
    this.addSolutionToken(headers, assignment, solution);
    this.addAssignmentToken(headers, assignment);

    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments`;
    return this.http.get<Comment[]>(url, {headers});
  }

  postComment(assignment: string, solution: string, comment: Comment): Observable<Comment> {
    const headers = {};
    this.addSolutionToken(headers, assignment, solution);
    this.addAssignmentToken(headers, assignment);

    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments`;
    return this.http.post<Comment>(url, comment, {headers});
  }

  deleteComment(assignment: string, solution: string, comment: string): Observable<Comment> {
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/comments/${comment}`;
    return this.http.delete<Comment>(url);
  }

  getEvaluations(assignment: Assignment | string, id?: string, task?: string): Observable<Evaluation[]> {
    const assignmentID = asID(assignment);
    const headers = {};
    if (id) {
      this.addSolutionToken(headers, assignmentID, id);
    }
    this.addAssignmentToken(headers, assignmentID);
    const url = `${environment.assignmentsApiUrl}/assignments/${assignmentID}/${id ? `solutions/${id}/` : ''}evaluations`;
    const params: Record<string, string> = task ? {task} : {};
    return this.http.get<Evaluation[]>(url, {headers, params});
  }

  streamEvaluations(assignment: string, solution: string): Observable<{ event: string, evaluation: Evaluation }> {
    const token = this.assignmentService.getToken(assignment);
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/events?token=${token}`;
    return new Observable(observer => {
      const eventSource = new EventSource(url);
      eventSource.addEventListener('message', (event: MessageEvent) => observer.next(JSON.parse(event.data)));
      eventSource.addEventListener('error', (error) => observer.error(error));
      return () => eventSource.close();
    });
  }

  getEvaluation(assignment: string, solution: string | undefined, evaluation: string): Observable<Evaluation> {
    const headers = {};
    this.addAssignmentToken(headers, assignment);
    if (solution) {
      this.addSolutionToken(headers, assignment, solution);
    }
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/${solution ? `solutions/${solution}/` : ''}evaluations/${evaluation}`;
    return this.http.get<Evaluation>(url, {headers});
  }

  createEvaluation(assignment: string, solution: string, dto: CreateEvaluationDto): Observable<Evaluation> {
    const headers = {};
    this.addAssignmentToken(headers, assignment);

    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations`;
    return this.http.post<Evaluation>(url, dto, {headers});
  }

  updateEvaluation(assignment: string, solution: string, id: string, dto: UpdateEvaluationDto): Observable<Evaluation> {
    const headers = {};
    this.addAssignmentToken(headers, assignment);

    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id}`;
    return this.http.patch<Evaluation>(url, dto, {headers});
  }

  deleteEvaluation(assignment: string, solution: string, id: string): Observable<Evaluation> {
    const headers = {};
    this.addAssignmentToken(headers, assignment);

    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/evaluations/${id}`;
    return this.http.delete<Evaluation>(url, {headers});
  }

  getAssignees(assignment: string): Observable<Assignee[]> {
    const headers = {};
    this.addAssignmentToken(headers, assignment);
    return this.http.get<Assignee[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/assignees`, {headers});
  }

  setAssignee(solution: Solution, assignee: string): Observable<Assignee> {
    const body = {
      assignee,
    };
    const headers = {};
    const assignmentID = solution.assignment;
    this.addAssignmentToken(headers, assignmentID);
    return this.http.put<Assignee>(`${environment.assignmentsApiUrl}/assignments/${assignmentID}/solutions/${solution._id}/assignee`, body, {headers});
  }

  private addAssignmentToken(headers: any, assignmentID: string) {
    const assignmentToken = this.assignmentService.getToken(assignmentID);
    if (assignmentToken) {
      headers['Assignment-Token'] = assignmentToken;
    }
  }

  private addSolutionToken(headers: any, assignmentID: string, solutionID: string): string | null {
    const token = this.getToken(assignmentID, solutionID);
    if (token) {
      headers['Solution-Token'] = token;
    }
    return token;
  }
}
