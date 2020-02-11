import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import Solution, {CheckResult, CheckSolution} from './model/solution';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolutionService {
  constructor(
    private http: HttpClient,
  ) {
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
