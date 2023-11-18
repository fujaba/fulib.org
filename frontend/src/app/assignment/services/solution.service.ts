import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Params} from '@angular/router';
import {forkJoin, Observable, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {StorageService} from '../../services/storage.service';
import {UserService} from '../../user/user.service';
import {ReadAssignmentDto} from '../model/assignment';
import {CheckResult, CheckSolution} from '../model/check';

import Solution, {AuthorInfo, CreateSolutionDto, ImportSolution, RichSolutionDto} from '../model/solution';
import {AssignmentService} from './assignment.service';

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
        if (user?.id) {
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

  submit(assignment: string, dto: CreateSolutionDto, files?: File[]): Observable<Solution> {
    let body;
    if (files?.length) {
      const data = new FormData();
      data.set('author', JSON.stringify(dto.author));
      for (const file of files) {
        data.append('files', file, file.name);
      }
      body = data;
    } else {
      body = dto;
    }
    return this.http.post<Solution>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions`, body).pipe(
      tap(response => this.setToken(assignment, response._id!, response.token!)),
    );
  }

  previewImport(assignment: string): Observable<ImportSolution[]> {
    return this.http.get<ImportSolution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/import`);
  }

  import(assignment: string, files?: File[], usernames?: string[]): Observable<ImportSolution[]> {
    let body;
    if (files?.length) {
      const data = new FormData();
      for (const file of files) {
        data.append('files', file, file.name);
      }
      body = data;
    }
    return this.http.post<ImportSolution[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/import`, body, {
      params: usernames ? {usernames} : undefined,
    });
  }

  get(assignment: string, id: string): Observable<Solution> {
    return this.http.get<Solution>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${id}`);
  }

  getAll(assignment: string, search?: string, ids?: string[]): Observable<RichSolutionDto[]> {
    const params: Params = {};
    search && (params.q = search);
    ids && (params.ids = ids);
    return this.http.get<RichSolutionDto[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions`, {
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
}
