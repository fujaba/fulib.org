import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {Member} from '../model/member';

@Injectable()
export class MemberService {
  constructor(
    private http: HttpClient,
  ) {
  }

  findAll(id: string): Observable<Member[]> {
    return this.http.get<Member[]>(`${environment.projectsApiUrl}/projects/${id}/members`);
  }

  update(member: Member): Observable<Member> {
    const {user, ...rest} = member;
    return this.http.put<Member>(`${environment.projectsApiUrl}/projects/${member.projectId}/members/${member.userId}`, rest).pipe(
      tap(newMember => newMember.user = user),
    );
  }
}
