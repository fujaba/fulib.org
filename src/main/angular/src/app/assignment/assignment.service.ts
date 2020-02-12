import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http'
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {saveAs} from 'file-saver';

import Assignment from './model/assignment';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private _draft?: Assignment | null;
  private _tokens: Map<string, string>;

  constructor(
    private http: HttpClient,
  ) {
  }

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
    }
    else {
      localStorage.removeItem('assignmentDraft');
    }
  }

  getToken(id: string): string | null {
    let token = this._tokens.get(id);
    if (typeof token == 'undefined') {
      token = localStorage.getItem(`assignmentToken/${id}`);
      this._tokens.set(id, token);
    }
    return token;
  }

  setToken(id: string, token: string | null): void {
    this._tokens.set(id, token);
    const key = `assignmentToken/${id}`;
    if (token) {
      localStorage.setItem(key, token);
    }
    else {
      localStorage.removeItem(key);
    }
  }

  fromJson(json: string): Assignment {
    const reviver = (k, v) => k === 'deadline' ? new Date(v) : v;
    const data = JSON.parse(json, reviver);
    const assignment = new Assignment();
    Object.assign(assignment, data);
    return assignment;
  }

  toJson(assignment: Assignment, space?: string): string {
    const replacer = (k, v) => v instanceof Date ? v.toISOString() : v;
    return JSON.stringify(assignment, replacer, space);
  }

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

  submit(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Partial<Assignment>>(environment.apiURL + '/assignments', assignment)
      .pipe(map(partialResult => {
        this.setToken(partialResult.id, partialResult.token);
        const result = new Assignment();
        Object.assign(result, assignment);
        Object.assign(result, partialResult);
        return result;
      }));
  }

  get(id: string): Observable<Assignment> {
    return this.http.get<Assignment>(`${environment.apiURL}/assignments/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).pipe(
      map(a => {
        a.id = id;
        a.token = this.getToken(id);
        return a;
      })
    );
  }
}
