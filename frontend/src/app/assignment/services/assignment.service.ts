import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {saveAs} from 'file-saver';
import {Observable, of} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';

import {environment} from '../../../environments/environment';
import {StorageService} from '../../services/storage.service';
import {LintService} from '../../shared/lint.service';
import {Marker} from '../../shared/model/marker';
import {UserService} from '../../user/user.service';
import Assignment, {CreateAssignmentDto, UpdateAssignmentDto} from '../model/assignment';
import {CheckAssignment, CheckResult} from '../model/check';
import Course from '../model/course';
import {SearchResult, SearchSummary} from '../model/search-result';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
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

  loadDraft(id: string | undefined): Assignment | undefined {
    const stored = localStorage.getItem(this.getDraftKey(id));
    return stored ? JSON.parse(stored) : undefined;
  }

  saveDraft(id: string | undefined, value: Assignment) {
    localStorage.setItem(this.getDraftKey(id), JSON.stringify(value));
  }

  deleteDraft(id: string | undefined) {
    localStorage.removeItem(this.getDraftKey(id));
  }

  // --------------- Tokens ---------------

  getToken(id: string): string | null {
    return this.storage.get(`assignmentToken/${id}`);
  }

  setToken(id: string, token: string | null): void {
    this.storage.set(`assignmentToken/${id}`, token);
  }

  // --------------- Import/Export ---------------

  download(assignment: any): void {
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

  findOwn(archived = false): Observable<Assignment[]> {
    const ownIds = this.getOwnIds();
    return this.users.getCurrent().pipe(
      switchMap(user => this.findAll(ownIds, user?.id, archived)),
    );
  }

  findAll(ids?: string[], createdBy?: string, archived = false): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${environment.assignmentsApiUrl}/assignments`, {
      params: {
        ...(ids ? {ids: ids.join(',')} : {}),
        ...(createdBy ? {createdBy} : {}),
        archived,
      },
    }).pipe(
      map(results => {
        for (const result of results) {
          result.token = this.getToken(result._id) ?? undefined;
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

  create(dto: CreateAssignmentDto): Observable<Assignment> {
    return this.http.post<Assignment>(`${environment.assignmentsApiUrl}/assignments`, dto).pipe(
      map(response => {
        this.setToken(response._id, response.token!);
        return response;
      }),
    );
  }

  update(id: string, dto: UpdateAssignmentDto): Observable<Assignment> {
    const token = this.getToken(id);
    const headers = this.getHeaders(token);
    return this.http.patch<Assignment>(`${environment.assignmentsApiUrl}/assignments/${id}`, dto, {headers}).pipe(
      tap(({token}) => token && this.setToken(id, token)),
    );
  }

  delete(assignment: string): Observable<Assignment> {
    const headers = this.getHeaders(this.getToken(assignment));
    return this.http.delete<Assignment>(`${environment.assignmentsApiUrl}/assignments/${assignment}`, {headers}).pipe(
      tap(() => {
        this.setToken(assignment, null);
        this.deleteDraft(assignment);
      }),
    );
  }

  get(id: string): Observable<Assignment> {
    const headers = this.getHeaders(this.getToken(id));
    return this.http.get<Assignment>(`${environment.assignmentsApiUrl}/assignments/${id}`, {headers}).pipe(
      map(a => {
        a.token ??= this.getToken(id) ?? undefined;
        return a;
      }),
    );
  }

  search(id: string, q: string, context = 2, glob?: string, wildcard?: string): Observable<SearchResult[]> {
    const headers = this.getHeaders(this.getToken(id));
    const params: Record<string, string | number> = {q, context};
    glob && (params.glob = glob);
    wildcard && (params.wildcard = wildcard);
    return this.http.get<SearchResult[]>(`${environment.assignmentsApiUrl}/assignments/${id}/search`, {
      params,
      headers,
    });
  }

  searchSummary(id: string, q: string, glob?: string, wildcard?: string): Observable<SearchSummary> {
    const headers = this.getHeaders(this.getToken(id));
    const params: Record<string, string> = {q};
    glob && (params.glob = glob);
    wildcard && (params.wildcard = wildcard);
    return this.http.get<SearchSummary>(`${environment.assignmentsApiUrl}/assignments/${id}/search/summary`, {
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
    const index = ids.indexOf(assignment._id);
    if (index < 0 || index + 1 >= ids.length) {
      return of(undefined);
    }

    const nextID = ids[index + 1];
    return this.get(nextID);
  }
}
