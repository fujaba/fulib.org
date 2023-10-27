import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Member} from "../../user/member";
import {environment} from "../../../environments/environment";

export type Namespace = 'assignments' | 'courses';

@Injectable()
export class MemberService {
  constructor(
    private http: HttpClient,
  ) {
  }

  findAll(namespace: Namespace, parent: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${environment.assignmentsApiUrl}/${namespace}/${parent}/members`);
  }

  update(namespace: Namespace, member: Member): Observable<Member> {
    const {_user, parent, user, ...rest} = member;
    return this.http.put<Member>(`${environment.assignmentsApiUrl}/${namespace}/${parent}/members/${user}`, rest).pipe(
      tap(newMember => newMember._user = _user),
    );
  }

  delete(namespace: Namespace, parent: string, user: string): Observable<Member> {
    return this.http.delete<Member>(`${environment.assignmentsApiUrl}/${namespace}/${parent}/members/${user}`);
  }
}
