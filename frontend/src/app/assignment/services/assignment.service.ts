import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Params} from '@angular/router';

import {saveAs} from 'file-saver';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';

import {environment} from '../../../environments/environment';
import {LintService} from '../../shared/lint.service';
import {Marker} from '../../shared/model/marker';
import {StorageService} from '../../storage.service';
import {UserService} from '../../user/user.service';
import Assignment from '../model/assignment';
import {CheckAssignment, CheckResult} from '../model/check';
import Course from '../model/course';
import {SearchResult} from '../model/search-result';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private _cache = new Map<string, Assignment>();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private lintService: LintService,
    private users: UserService,
  ) {
  }

  // --------------- Assignment Drafts ---------------

  private getDraftKey(id?: string) {
    return id ? `assignments/${id}/draft` : 'assignmentDraft';
  }

  loadDraft(id?: string): Assignment | undefined {
    const stored = localStorage.getItem(this.getDraftKey(id));
    return stored ? JSON.parse(stored) : undefined;
  }

  saveDraft(id?: string, value?: Assignment) {
    const key = this.getDraftKey(id);
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  }

  // --------------- Tokens ---------------

  getToken(id: string): string | null {
    return this.storage.get(`assignmentToken/${id}`);
  }

  setToken(id: string, token: string | null): void {
    // changing the token invalidates the cache because it changes the response
    this._cache.delete(id);
    this.storage.set(`assignmentToken/${id}`, token);
  }

  // --------------- Import/Export ---------------

  download(assignment: Assignment): void {
    const json = JSON.stringify(assignment, undefined, '  ');
    saveAs(new Blob([json], {type: 'application/json'}), assignment.title + '.json');
  }

  upload(file: File): Observable<Assignment> {
    return new Observable(subscriber => {
      const reader = new FileReader();
      reader.onload = _ => {
        const text = reader.result as string;
        const assignment = JSON.parse(text);
        subscriber.next(assignment);
      };
      reader.readAsText(file);
    });
  }

  // --------------- HTTP Methods ---------------

  getOwnIds(): string[] {
    const pattern = /^assignmentToken\/(.*)$/;
    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      const match = pattern.exec(key);
      if (!match) {
        continue;
      }

      const id = match[1] as string;
      ids.push(id);
    }

    return ids;
  }

  getOwn(): Observable<Assignment[]> {
    return this.users.current$.pipe(
      take(1),
      switchMap(user => user && user.id ? this.getByUserId(user.id) : this.getOwnLocal()),
    );
  }

  private getOwnLocal(): Observable<Assignment[]> {
    return forkJoin(this.getOwnIds().map(id => this.get(id).pipe(
      catchError(() => of(undefined)),
    ))).pipe(
      map(assignments => assignments.filter((a): a is Assignment => !!a)),
    );
  }

  getByUserId(userId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${environment.assignmentsApiUrl}/assignments`, {params: {createdBy: userId}}).pipe(
      map(results => {
        for (const result of results) {
          result.token = this.getToken(result._id!) ?? undefined;
          this._cache.set(result._id!, result);
        }
        return results;
      }),
    );
  }

  check(assignment: CheckAssignment): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.assignmentsApiUrl}/assignments/check`, assignment);
  }

  lint(result: CheckResult): Marker[] {
    const grouped = new Map<string, { marker: Marker, tasks: number[] }>();

    for (let i = 0; i < result.results.length; i++) {
      const taskNum = i + 1;
      const taskResult = result.results[i];
      for (const marker of this.lintService.lint(taskResult.remark)) {
        marker.from.line -= 2;
        marker.to.line -= 2;

        const key = `${marker.from.line}:${marker.from.ch}-${marker.to.line}:${marker.to.ch}:${marker.severity}:${marker.message}`;
        let entry = grouped.get(key);
        if (entry) {
          entry.tasks.push(taskNum);
        } else {
          entry = {marker, tasks: [taskNum]};
          grouped.set(key, entry);
        }
      }
    }

    const markers: Marker[] = [];

    for (const {marker, tasks} of grouped.values()) {
      marker.message = `[${tasks.length === 1 ? 'task' : 'tasks'} ${tasks.join(', ')}] ${marker.message}`;
      markers.push(marker);
    }

    return markers;
  }

  create(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Assignment>(`${environment.assignmentsApiUrl}/assignments`, assignment).pipe(
      map(response => {
        this.setToken(response._id!, response.token!);
        this._cache.set(response._id!, response);
        return response;
      }),
    );
  }

  update(assignment: Assignment): Observable<Assignment> {
    const headers = this.getHeaders(assignment.token);
    return this.http.patch<Assignment>(`${environment.assignmentsApiUrl}/assignments/${assignment._id}`, assignment, {headers}).pipe(
      tap(response => {
        response.token = assignment.token;
        this._cache.set(assignment._id!, response);
      }),
    );
  }

  get(id: string): Observable<Assignment> {
    const cached = this._cache.get(id);
    if (cached) {
      return of(cached);
    }

    const headers = this.getHeaders(this.getToken(id));
    return this.http.get<Assignment>(`${environment.assignmentsApiUrl}/assignments/${id}`, {headers}).pipe(
      map(a => {
        a.token ??= this.getToken(id) ?? undefined;
        this._cache.set(id, a);
        return a;
      }),
    );
  }

  search(id: string, q: string, context = 2, glob?: string): Observable<SearchResult[]> {
    const headers = this.getHeaders(this.getToken(id));
    const params: Params = {q, context};
    glob && (params.glob = glob);
    return this.http.get<SearchResult[]>(`${environment.assignmentsApiUrl}/assignments/${id}/search`, {
      params,
      headers,
    });
  }

  private getHeaders(token?: string | null | undefined): Record<string, string> {
    return token ? {
      'Assignment-Token': token,
    } : {};
  }

  getNext(course: Course, assignment: Assignment): Observable<Assignment | undefined> {
    const ids = course.assignments!;
    const index = ids.indexOf(assignment._id!);
    if (index < 0 || index + 1 >= ids.length) {
      return of(undefined);
    }

    const nextID = ids[index + 1];
    return this.get(nextID);
  }
}
