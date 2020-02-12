import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import Solution, {CheckResult, CheckSolution} from './model/solution';
import {environment} from '../../environments/environment';
import Assignment from './model/assignment';

@Injectable({
  providedIn: 'root'
})
export class SolutionService {
  private _drafts = new Map<string, string | null>();

  constructor(
    private http: HttpClient,
  ) {
  }

  getDraft(assignment: Assignment): string | null {
    let draft = this._drafts.get(assignment.id);
    if (typeof draft === 'undefined') {
      draft = localStorage.getItem(`solutionDraft/${assignment.id}`);
      this._drafts.set(assignment.id, draft);
    }
    return draft;
  }

  setDraft(assignment: Assignment, solution: string | null): void {
    this._drafts.set(assignment.id, solution);
    const key = `solutionDraft/${assignment.id}`;
    if (solution) {
      localStorage.setItem(key, solution);
    }
    else {
      localStorage.removeItem(key);
    }
  }

  check(solution: CheckSolution): Observable<CheckResult> {
    return this.http.post<CheckResult>(`${environment.apiURL}/assignments/${solution.assignment.id}/check`, solution);
  }

  submit(solution: Solution): Observable<Solution> {
    return this.http.post<Solution>(`${environment.apiURL}/assignments/${solution.assignment.id}/solutions`, solution).pipe(
      map(partialResult => {
        const result = new Solution();
        Object.assign(result, solution);
        Object.assign(result, partialResult);
        return result;
      })
    );
  }
}
