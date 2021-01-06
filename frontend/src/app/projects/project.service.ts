import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {UserService} from '../user/user.service';
import {Container} from './model/container';
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
    return this.http.get<Project>(`${environment.apiURL}/projects/${id}`);
  }

  update(project: Project): Observable<Project> {
    return this.http.put<Project>(`${environment.apiURL}/projects/${project.id}`, project);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiURL}/projects/${id}`);
  }

  getContainer(projectId: string): Observable<Container> {
    return this.http.get<Container>(`${environment.apiURL}/projects/${projectId}/container`);
  }

  getOwn(): Observable<Project[]> {
    return this.users.current$.pipe(switchMap(user => {
      if (!user || !user.id) {
        return of([]);
      }
      return this.http.get<Project[]>(`${environment.apiURL}/projects`, {
        params: {userId: user.id},
      });
    }));
  }
}
