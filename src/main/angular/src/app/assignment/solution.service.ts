import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, flatMap, map} from 'rxjs/operators';

import Solution, {CheckResult, CheckSolution} from './model/solution';
import {environment} from '../../environments/environment';
import Assignment from './model/assignment';
import {AssignmentService} from './assignment.service';
import Comment from './model/comment';
import {StorageService} from '../storage.service';
import TaskGrading from './model/task-grading';

function asID(id: { id?: string } | string): string {
  return typeof id === 'string' ? id : id.id;
}

type AssignmentId = { id: string; };
type SolutionId = { id: string, assignment: AssignmentId; };
type SolutionResponse = { id: string, timeStamp: string, token: string };
type CommentResponse = { id: string, timeStamp: string, html: string };
type TaskGradingResponse = { timeStamp: string };

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

  // --------------- Solution Drafts ---------------

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

  getOwnIds(assignment?: Assignment | string): { assignment: string, id: string; }[] {
    const assignmentID = assignment ? asID(assignment) : null;

    const pattern = /^solutionToken\/(.*)\/(.*)$/;
    const ids: { assignment: string, id: string; }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const match = pattern.exec(key);
      if (!match) {
        continue;
      }

      const assignment = match[1] as string;
      if (assignmentID && assignment !== assignmentID) {
        continue;
      }

      const id = match[2] as string;
      ids.push({assignment, id});
    }

    return ids;
  }

  getOwn(assignment?: Assignment | string): Observable<Solution> {
    return of(...this.getOwnIds(assignment)).pipe(flatMap(({assignment, id}) => this.get(assignment, id)))
  }

  // --------------- HTTP Methods ---------------

  check(solution: CheckSolution): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.apiURL}/assignments/${solution.assignment.id}/check`, solution);
  }

  submit(solution: Solution): Observable<Solution> {
    return this.http.post<SolutionResponse>(`${environment.apiURL}/assignments/${solution.assignment.id}/solutions`, solution).pipe(
      map(response => {
        this.setToken(solution.assignment.id, response.id, response.token);
        const result: Solution = {
          ...solution,
          ...response,
          timeStamp: new Date(response.timeStamp),
        };
        return result;
      }),
    );
  }

  get(assignment: Assignment | string, id: string): Observable<Solution> {
    const assignmentID = asID(assignment);
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken(assignmentID, id);
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
        solution.token = token;
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
    return this.http.get<{ solutions: Solution[] }>(`${environment.apiURL}/assignments/${assignmentID}/solutions`, {headers}).pipe(
      map(result => {
        for (let solution of result.solutions) {
          solution.token = this.getToken(assignmentID, solution.id);
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
    return this.http.post<CommentResponse>(`${environment.apiURL}/assignments/${solution.assignment.id}/solutions/${solution.id}/comments`, comment).pipe(
      map(response => {
        const result: Comment = {
          ...comment,
          parent: solution.id,
          ...response,
          timeStamp: new Date(response.timeStamp),
        };
        return result;
      }),
    );
  }

  getGradings(assignment: Assignment | string, id: string): Observable<TaskGrading[]> {
    const assignmentID = asID(assignment);
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken(assignmentID, id);
    if (token) {
      headers['Solution-Token'] = token;
    }
    const assignmentToken = this.assignmentService.getToken(assignmentID);
    if (assignmentToken) {
      headers['Assignment-Token'] = assignmentToken;
    }
    return this.http.get<{ gradings: TaskGrading[] }>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${id}/gradings`, {headers}).pipe(
      map(response => response.gradings),
      catchError(err => {
        err.error.status = err.status;
        throw err.error;
      }),
    );
  }

  postGrading(grading: TaskGrading): Observable<TaskGrading> {
    const solutionID = grading.solution.id;
    const assignmentID = grading.solution.assignment.id;
    const headers = {
      'Content-Type': 'application/json',
    };
    const assignmentToken = this.assignmentService.getToken(assignmentID);
    if (assignmentToken) {
      headers['Assignment-Token'] = assignmentToken;
    }
    return this.http.post<TaskGradingResponse>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${solutionID}/gradings`, grading, {headers}).pipe(
      map(response => {
        const result: TaskGrading = {
          ...grading,
          timeStamp: new Date(response.timeStamp),
        };
        return result;
      }),
      catchError(err => {
        err.error.status = err.status;
        throw err.error;
      }),
    );
  }

  setAssignee(solution: Solution, assignee: string): Observable<void> {
    const body = {
      assignee,
    };
    const headers = {};
    const assignmentToken = this.assignmentService.getToken(solution.assignment.id);
    if (assignmentToken) {
      headers['Assignment-Token'] = assignmentToken;
    }
    return this.http.put<void>(`${environment.apiURL}/assignments/${solution.assignment.id}/solutions/${solution.id}/assignee`, body, {headers});
  }
}
