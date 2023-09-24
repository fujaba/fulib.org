import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {saveAs} from 'file-saver';
import {Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {environment} from '../../../environments/environment';
import {StorageService} from '../../services/storage.service';
import {LintService} from '../../shared/lint.service';
import {Marker} from '../../shared/model/marker';
import {UserService} from '../../user/user.service';
import Assignment, {CreateAssignmentDto, ReadAssignmentDto, UpdateAssignmentDto} from '../model/assignment';
import {CheckAssignment, CheckResult} from '../model/check';
import Course from '../model/course';
import {SearchResult, SearchSummary} from '../model/search-result';

@Injectable()
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

  loadDraft(id: string | undefined): Assignment | CreateAssignmentDto | undefined {
    const stored = localStorage.getItem(this.getDraftKey(id));
    return stored ? JSON.parse(stored) : undefined;
  }

  saveDraft(id: string | undefined, value: Assignment | CreateAssignmentDto) {
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

  findOwn(archived = false): Observable<ReadAssignmentDto[]> {
    const ownIds = this.getOwnIds();
    return this.users.getCurrent().pipe(
      switchMap(user => this.findAll(ownIds, user?.id, archived)),
    );
  }

  findAll(ids?: string[], createdBy?: string, archived = false): Observable<ReadAssignmentDto[]> {
    return this.http.get<ReadAssignmentDto[]>(`${environment.assignmentsApiUrl}/assignments`, {
      params: {
        ...(ids ? {ids: ids.join(',')} : {}),
        ...(createdBy ? {createdBy} : {}),
        archived,
      },
    });
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
    return this.http.patch<Assignment>(`${environment.assignmentsApiUrl}/assignments/${id}`, dto).pipe(
      tap(({token}) => token && this.setToken(id, token)),
    );
  }

  delete(assignment: string): Observable<Assignment> {
    return this.http.delete<Assignment>(`${environment.assignmentsApiUrl}/assignments/${assignment}`).pipe(
      tap(() => {
        this.setToken(assignment, null);
        this.deleteDraft(assignment);
      }),
    );
  }

  get(id: string): Observable<Assignment | ReadAssignmentDto> {
    return this.http.get<Assignment | ReadAssignmentDto>(`${environment.assignmentsApiUrl}/assignments/${id}`).pipe(
      tap(a => {
        if ('token' in a && a.token) {
          this.setToken(id, a.token);
        }
      }),
    );
  }

  search(id: string, q: string, context = 2, glob?: string, wildcard?: string): Observable<SearchResult[]> {
    const params: Record<string, string | number> = {q, context};
    glob && (params.glob = glob);
    wildcard && (params.wildcard = wildcard);
    return this.http.get<SearchResult[]>(`${environment.assignmentsApiUrl}/assignments/${id}/search`, {
      params,
    });
  }

  searchSummary(id: string, q: string, glob?: string, wildcard?: string): Observable<SearchSummary> {
    const params: Record<string, string> = {q};
    glob && (params.glob = glob);
    wildcard && (params.wildcard = wildcard);
    return this.http.get<SearchSummary>(`${environment.assignmentsApiUrl}/assignments/${id}/search/summary`, {
      params,
    });
  }

  moss(assignment: string): Observable<string> {
    return this.http.put(`${environment.assignmentsApiUrl}/assignments/${assignment}/moss`, {}, {
      responseType: 'text',
    });
  }

  getNext(course: Course, assignment: ReadAssignmentDto): Observable<Assignment | ReadAssignmentDto | undefined> {
    const ids = course.assignments!;
    const index = ids.indexOf(assignment._id);
    if (index < 0 || index + 1 >= ids.length) {
      return of(undefined);
    }

    const nextID = ids[index + 1];
    return this.get(nextID);
  }
}
