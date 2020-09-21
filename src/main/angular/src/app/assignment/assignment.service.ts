import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {saveAs} from 'file-saver';
import Response from '../model/codegen/response';
import {Marker, ScenarioEditorService} from '../scenario-editor.service';

import Assignment from './model/assignment';
import {environment} from '../../environments/environment';
import {StorageService} from '../storage.service';
import Course from './model/course';
import {CheckAssignment, CheckResult} from './model/check';

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
    return forkJoin(this.getOwnIds().map(id => this.get(id)));
  }

  check(assignment: CheckAssignment): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.apiURL}/assignments/create/check`, assignment);
  }

  lint(result: CheckResult): Marker[] {
    const markers = [];

    for (let i = 0; i < result.results.length; i++) {
      const taskResult = result.results[i];
      const response: Response = {
        exitCode: 0,
        output: taskResult.output,
      };
      const markers = this.scenarioEditorService.lint(response);
      for (const marker of markers) {
        marker.message = `[task ${i + 1}] ${marker.message}`;
        marker.from.line -= 2;
        marker.to.line -= 2;
      }
      markers.push(...markers);
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

    const headers = {
      'Content-Type': 'application/json',
    };
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
