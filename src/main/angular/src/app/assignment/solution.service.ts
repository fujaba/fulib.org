import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import Solution from './model/solution';
import {environment} from '../../environments/environment';
import Assignment from './model/assignment';
import {AssignmentService} from './assignment.service';
import Comment from './model/comment';
import {StorageService} from '../storage.service';
import TaskGrading from './model/task-grading';
import {CheckResult, CheckSolution} from './model/check';

function asID(id: { id?: string } | string): string {
  return typeof id === 'string' ? id : id.id!;
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

  // --------------- HTTP Methods ---------------

  check(solution: CheckSolution): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.apiURL}/assignments/${solution.assignment.id}/check`, solution);
  }

  submit(solution: Solution): Observable<Solution> {
    return this.http.post<SolutionResponse>(`${environment.apiURL}/assignments/${solution.assignment}/solutions`, solution).pipe(
      map(response => {
        this.setToken(solution.assignment, response.id, response.token);
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
    const token = this.addSolutionToken(headers, assignmentID, id);
    this.addAssignmentToken(headers, assignmentID);
    return this.http.get<Solution>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${id}`, {headers}).pipe(
      map(solution => {
        solution.id = id;
        solution.token = token ?? undefined;
        return solution;
      }),
    );
  }

  getAll(assignment: Assignment | string): Observable<Solution[]> {
    const assignmentID = asID(assignment);
    const headers = {
      'Content-Type': 'application/json',
    };
    this.addAssignmentToken(headers, assignmentID);
    return this.http.get<{ solutions: Solution[] }>(`${environment.apiURL}/assignments/${assignmentID}/solutions`, {headers}).pipe(
      map(result => {
        for (const solution of result.solutions) {
          solution.token = this.getToken(assignmentID, solution.id!) ?? undefined;
        }
        return result.solutions;
      }),
    );
  }

  getComments(assignment: Assignment | string, id: string): Observable<Comment[]> {
    const assignmentID = asID(assignment);
    const headers = {
      'Content-Type': 'application/json',
    };
    this.addSolutionToken(headers, assignmentID, id);
    this.addAssignmentToken(headers, assignmentID);
    return this.http.get<{ children: Comment[] }>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${id}/comments`, {headers}).pipe(
      map(result => {
        for (const comment of result.children) {
          comment.parent = id;
        }
        return result.children;
      }),
    );
  }

  postComment(solution: Solution, comment: Comment): Observable<Comment> {
    const assignmentID = solution.assignment;
    const headers = {
      'Content-Type': 'application/json',
    };
    this.addSolutionToken(headers, assignmentID, solution.id!);
    this.addAssignmentToken(headers, assignmentID);
    return this.http.post<CommentResponse>(`${environment.apiURL}/assignments/${solution.assignment}/solutions/${solution.id}/comments`, comment, {headers}).pipe(
      map(response => {
        const result: Comment = {
          ...comment,
          parent: solution.id!,
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
    this.addSolutionToken(headers, assignmentID, id);
    this.addAssignmentToken(headers, assignmentID);
    return this.http.get<{ gradings: TaskGrading[] }>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${id}/gradings`, {headers}).pipe(
      map(response => response.gradings),
    );
  }

  postGrading(grading: TaskGrading): Observable<TaskGrading> {
    const solutionID = grading.solution.id;
    const assignmentID = grading.solution.assignment;
    const headers = {
      'Content-Type': 'application/json',
    };
    this.addAssignmentToken(headers, assignmentID);
    return this.http.post<TaskGradingResponse>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${solutionID}/gradings`, grading, {headers}).pipe(
      map(response => {
        const result: TaskGrading = {
          ...grading,
          timeStamp: new Date(response.timeStamp),
        };
        return result;
      }),
    );
  }

  setAssignee(solution: Solution, assignee: string): Observable<void> {
    const body = {
      assignee,
    };
    const headers = {};
    const assignmentID = solution.assignment;
    this.addAssignmentToken(headers, assignmentID);
    return this.http.put<void>(`${environment.apiURL}/assignments/${assignmentID}/solutions/${solution.id}/assignee`, body, {headers});
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
