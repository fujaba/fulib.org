import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {saveAs} from 'file-saver';

import Assignment from './model/assignment';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  constructor() {
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
}
