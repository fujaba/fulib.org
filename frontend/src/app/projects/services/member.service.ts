import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {ProjectMember} from "../model/project-member";

@Injectable()
export class MemberService {
  constructor(
    private http: HttpClient,
  ) {
  }

  findAll(id: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${environment.projectsApiUrl}/projects/${id}/members`);
  }

  update(member: ProjectMember): Observable<ProjectMember> {
    const {_user, ...rest} = member;
    return this.http.put<ProjectMember>(`${environment.projectsApiUrl}/projects/${member.projectId}/members/${member.userId}`, rest).pipe(
      tap(newMember => newMember._user = _user),
    );
  }

  delete({projectId, userId}: ProjectMember): Observable<ProjectMember> {
    return this.http.delete<ProjectMember>(`${environment.projectsApiUrl}/projects/${projectId}/members/${userId}`);
  }
}
