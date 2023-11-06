import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Assignee, PatchAssigneeDto, UpdateAssigneeDto} from "../model/assignee";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

function url(assignment: string, solution: string) {
  return `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/assignee`;
}

@Injectable()
export class AssigneeService {
  constructor(
    private http: HttpClient,
  ) {
  }

  findAll(assignment: string): Observable<Assignee[]> {
    return this.http.get<Assignee[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/assignees`);
  }

  findOne(assignment: string, solution: string): Observable<Assignee> {
    return this.http.get<Assignee>(url(assignment, solution));
  }

  setAssignee(assignment: string, solution: string, assignee: string | undefined): Observable<Assignee | undefined> {
    return assignee
      ? this.set(assignment, solution, {assignee})
      : this.delete(assignment, solution).pipe(map(() => undefined));
  }

  set(assignment: string, solution: string, dto: UpdateAssigneeDto): Observable<Assignee> {
    return this.http.put<Assignee>(url(assignment, solution), dto);
  }

  update(assignment: string, solution: string, dto: PatchAssigneeDto): Observable<Assignee> {
    return this.http.patch<Assignee>(url(assignment, solution), dto);
  }

  delete(assignment: string, solution: string): Observable<Assignee> {
    return this.http.delete<Assignee>(url(assignment, solution));
  }
}
