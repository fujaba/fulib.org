import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Assignee} from "../model/assignee";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class AssigneeService {
  constructor(
    private http: HttpClient,
  ) {
  }

  getAssignees(assignment: string): Observable<Assignee[]> {
    return this.http.get<Assignee[]>(`${environment.assignmentsApiUrl}/assignments/${assignment}/assignees`);
  }

  getAssignee(assignment: string, solution: string): Observable<Assignee> {
    return this.http.get<Assignee>(`${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/assignee`);
  }

  setAssignee(assignment: string, solution: string, assignee: string | undefined): Observable<Assignee> {
    const url = `${environment.assignmentsApiUrl}/assignments/${assignment}/solutions/${solution}/assignee`;
    return assignee ? this.http.put<Assignee>(url, {assignee}) : this.http.delete<Assignee>(url);
  }
}
