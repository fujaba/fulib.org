import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {saveAs} from 'file-saver';
import {forkJoin, Observable, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {Marker} from '../model/codegen/marker';
import Response from '../model/codegen/response';
import {ScenarioEditorService} from '../scenario-editor.service';
import {StorageService} from '../storage.service';
import {UserService} from '../user/user.service';
import Assignment from './model/assignment';
import {CheckAssignment, CheckResult} from './model/check';
import Course from './model/course';

interface AssignmentResponse {
  id: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private _draft?: Assignment | null;
  private _cache = new Map<string, Assignment>();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private scenarioEditorService: ScenarioEditorService,
    private users: UserService,
  ) {
  }

  // --------------- Assignment Drafts ---------------

  get draft(): Assignment | null {
    if (typeof this._draft === 'undefined') {
      const json = localStorage.getItem('assignmentDraft');
      this._draft = json ? this.fromJson(json) : null;
    }
    return this._draft;
  }

  set draft(value: Assignment | null) {
    this._draft = value;
    if (value) {
      localStorage.setItem('assignmentDraft', JSON.stringify(value));
    } else {
      localStorage.removeItem('assignmentDraft');
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

  // --------------- JSON Conversion ---------------

  fromJson(json: string): Assignment {
    const reviver = (k, v) => k === 'deadline' && v ? new Date(v) : v;
    const data = JSON.parse(json, reviver);
    const assignment = new Assignment();
    Object.assign(assignment, data);
    return assignment;
  }

  toJson(assignment: Assignment, space?: string): string {
    return JSON.stringify(assignment, undefined, space);
  }

  // --------------- Import/Export ---------------

  download(assignment: Assignment): void {
    const json = this.toJson(assignment, '  ');
    saveAs(new Blob([json], {type: 'application/json'}), assignment.title + '.json');
  }

  upload(file: File): Observable<Assignment> {
    return new Observable(subscriber => {
      const reader = new FileReader();
      reader.onload = _ => {
        const text = reader.result as string;
        const assignment = this.fromJson(text);
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
      flatMap(user => {
        if (user && user.id) {
          return this.getByUserId(user.id);
        } else {
          return forkJoin(this.getOwnIds().map(id => this.get(id)));
        }
      }),
    );
  }

  getByUserId(userId: string): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${environment.apiURL}/assignments`, {params: {userId}}).pipe(
      map(results => {
        for (let result of results) {
          result.token = this.getToken(result.id!) ?? undefined;
          this._cache.set(result.id!, result);
        }
        return results;
      }),
    );
  }

  check(assignment: CheckAssignment): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.apiURL}/assignments/create/check`, assignment);
  }

  lint(result: CheckResult): Marker[] {
    const grouped = new Map<string, { marker: Marker, tasks: number[] }>();

    for (let i = 0; i < result.results.length; i++) {
      const taskNum = i + 1;
      const taskResult = result.results[i];
      const response: Response = {
        id: '',
        exitCode: 0,
        output: taskResult.output,
        html: '',
      };

      for (const marker of this.scenarioEditorService.lint(response)) {
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
      marker.message = `[${tasks.length == 1 ? 'task' : 'tasks'} ${tasks.join(', ')}] ${marker.message}`;
      markers.push(marker);
    }

    return markers;
  }

  submit(assignment: Assignment): Observable<Assignment> {
    return this.http.post<AssignmentResponse>(environment.apiURL + '/assignments', assignment).pipe(
      map(response => {
        this.setToken(response.id, response.token);
        const result: Assignment = {
          ...assignment,
          ...response,
        };
        this._cache.set(response.id, result);
        return result;
      }),
    );
  }

  get(id: string): Observable<Assignment> {
    const cached = this._cache.get(id);
    if (cached) {
      return of(cached);
    }

    const headers = {};
    const token = this.getToken(id);
    if (token) {
      headers['Assignment-Token'] = token;
    }
    return this.http.get<Assignment>(`${environment.apiURL}/assignments/${id}`, {headers}).pipe(
      map(a => {
        a.id = id;
        a.token = this.getToken(id) ?? undefined;
        this._cache.set(id, a);
        return a;
      }),
    );
  }

  getNext(course: Course, assignment: Assignment): Observable<Assignment | undefined> {
    const ids = course.assignmentIds!;
    const index = ids.indexOf(assignment.id!);
    if (index < 0 || index + 1 >= ids.length) {
      return of(undefined);
    }

    const nextID = ids[index + 1];
    return this.get(nextID);
  }
}
