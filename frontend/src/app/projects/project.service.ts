import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {UserService} from '../user/user.service';
import {Project, ProjectStub} from './model/project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {

  constructor(
    private users: UserService,
    private http: HttpClient,
  ) {
  }

  create(project: ProjectStub): Observable<Project> {
    return this.http.post<Project>(`${environment.apiURL}/projects`, project);
  }

  get(id: string): Observable<Project> {
    return this.http.get<Project>(`${environment.apiURL}/projects/${id}`, {
      headers: {'Content-Type': 'application/json'},
    });
  }

  update(project: Project): Observable<Project> {
    return this.http.put<Project>(`${environment.apiURL}/projects/${project.id}`, project);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiURL}/projects/${id}`);
  }

  getOwn(): Observable<Project[]> {
    return this.users.current$.pipe(switchMap(user => {
      if (!user || !user.id) {
        return of([]);
      }
      return this.http.get<Project[]>(`${environment.apiURL}/projects`, {
        headers: {'Content-Type': 'application/json'},
        params: {userId: user.id},
      });
    }));
  }
}
