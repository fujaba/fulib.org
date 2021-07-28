import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
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
}
