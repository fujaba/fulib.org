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
  constructor(
    private http: HttpClient,
  ) {
  }

  download(assignment: Assignment): void {
    const replacer = (k, v) => v instanceof Date ? v.toISOString() : v;
    const content = JSON.stringify(assignment, replacer, '  ');
    saveAs(new Blob([content], {type: 'application/json'}), assignment.title + '.json');
  }

  upload(file: File): Observable<Assignment> {
    return new Observable(subscriber => {
      const reader = new FileReader();
      reader.onload = _ => {
        const text = reader.result as string;
        const reviver = (k, v) => k === 'deadline' ? new Date(v) : v;
        const data = JSON.parse(text, reviver);
        const assignment = new Assignment();
        Object.assign(assignment, data);
        subscriber.next(assignment);
      };
      reader.readAsText(file);
    });
  }

  submit(assignment: Assignment): Observable<Assignment> {
    return this.http.post<Partial<Assignment>>(environment.apiURL + '/assignments', assignment)
      .pipe(map(partialResult => {
        const result = new Assignment();
        Object.assign(result, assignment);
        Object.assign(result, partialResult);
        return result;
      }));
  }

  get(id: string): Observable<Assignment> {
    return this.http.get<Assignment>(`${environment.apiURL}/assignment/${id}`);
  }
}
