import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

import Solution, {CheckResult, CheckSolution} from './model/solution';
import {environment} from '../../environments/environment';
import Assignment from './model/assignment';
import {AssignmentService} from './assignment.service';
import Comment from './model/comment';
import {StorageService} from '../storage.service';

function asID(id: {id?: string} | string): string {
  return typeof id === 'string' ? id : id.id;
}

@Injectable({
  providedIn: 'root'
})
export class SolutionService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private assignmentService: AssignmentService,
  ) {
  }

  get name(): string | null {
    return this.storageService.get('solutionName');
  }

  set name(value: string | null) {
    this.storageService.set('solutionName', value);
  }

  get studentID(): string | null {
    return this.storageService.get('solutionStudentID');
  }

  set studentID(value: string | null) {
    this.storageService.set('solutionStudentID', value);
  }

  get email(): string | null {
    return this.storageService.get('solutionEmail');
  }

  set email(value: string | null) {
    this.storageService.set('solutionEmail', value);
  }

  getDraft(assignment: Assignment): string | null {
    return this.storageService.get(`solutionDraft/${assignment.id}`);
  }

  setDraft(assignment: Assignment, solution: string | null): void {
    this.storageService.set(`solutionDraft/${assignment.id}`, solution);
  }

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

  getToken(id: string): string | null {
    return this.storageService.get(`solutionToken/${id}`);
  }

  setToken(id: string, token: string | null): void {
    this.storageService.set(`solutionToken/${id}`, token);
  }

  check(solution: CheckSolution): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.apiURL}/assignments/${solution.assignment.id}/check`, solution);
  }

  submit(solution: Solution): Observable<Solution> {
    return this.http.post<Solution>(`${environment.apiURL}/assignments/${solution.assignment.id}/solutions`, solution).pipe(
      map(partialResult => {
        this.setToken(partialResult.id, partialResult.token);
        const result = new Solution();
        Object.assign(result, solution);
        Object.assign(result, partialResult);
        return result;
      })
    );
  }

  get(assignment: Assignment | string, id: string): Observable<Solution> {
    const assignmentID = asID(assignment);
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken(id);
    if (token) {
      headers['Solution-Token'] = token;
    }
    const assignmentToken = this.assignmentService.getToken(assignmentID);
    if (assignmentToken) {
      headers['Assignment-Token'] = assignmentToken;
    }
    return this.http.get<Solution>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${id}`, {headers}).pipe(
      map(solution => {
        solution.id = id;
        solution.token = this.getToken(id);
        return solution;
      }),
      catchError(err => {
        err.error.status = err.status;
        throw err.error;
      }),
    );
  }

  getAll(assignment: Assignment | string): Observable<Solution[]> {
    const assignmentID = asID(assignment);
    const headers = {
      'Content-Type': 'application/json',
    };
    const assignmentToken = this.assignmentService.getToken(assignmentID);
    if (assignmentToken) {
      headers['Assignment-Token'] = assignmentToken;
    }
    return this.http.get<{solutions: Solution[]}>(`${environment.apiURL}/assignments/${assignmentID}/solutions`, {headers}).pipe(
      map(result => {
        for (let solution of result.solutions) {
          solution.token = this.getToken(solution.id);
        }
        return result.solutions;
      }),
      catchError(err => {
        err.error.status = err.status;
        throw err.error;
      }),
    );
  }

  getComments(assignment: Assignment | string, id: string): Observable<Comment[]> {
    const assignmentID = asID(assignment);
    return this.http.get<{ children: Comment[] }>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${id}/comments`).pipe(
      map(result => {
        for (let comment of result.children) {
          comment.parent = id;
        }
        return result.children;
      }),
    );
  }

  postComment(solution: Solution, comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiURL}/assignments/${solution.assignment.id}/solutions/${solution.id}/comments`, comment).pipe(
      map(partialResult => {
        const result = new Comment();
        result.parent = solution.id;
        Object.assign(result, comment);
        Object.assign(result, partialResult);
        return result;
      }),
    );
  }
}
