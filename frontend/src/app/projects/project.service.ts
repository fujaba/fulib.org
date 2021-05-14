import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {UserService} from '../user/user.service';
import {Container} from './model/container';
import {Project, ProjectStub} from './model/project';
import {LocalProjectService} from './local-project.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {

  constructor(
    private users: UserService,
    private http: HttpClient,
    private localProjectService: LocalProjectService,
  ) {
  }


  create(stub: ProjectStub): Observable<Project> {
    if (stub.local) {
      return of(this.localProjectService.create(stub));
    }
    return this.http.post<Project>(`${environment.projectsApiUrl}/projects`, stub);
  }

  get(id: string): Observable<Project> {
    const temporary = this.localProjectService.get(id);
    if (temporary) {
      return of(temporary);
    }
    return this.http.get<Project>(`${environment.projectsApiUrl}/projects/${id}`);
  }

  update(project: Project): Observable<Project> {
    if (project.local) {
      this.localProjectService.update(project);
      return of(project);
    }
    return this.http.put<Project>(`${environment.projectsApiUrl}/projects/${project.id}`, project);
  }

  delete({id, local}: {id: string, local?: boolean}): Observable<void> {
    this.localProjectService.delete(id);
    return local ? of(undefined) : this.http.delete<void>(`${environment.projectsApiUrl}/projects/${id}`);
  }

  getContainer(projectId: string): Observable<Container> {
    return this.http.get<Container>(`${environment.projectsApiUrl}/projects/${projectId}/container`);
  }

  createContainer(projectId: string): Observable<Container> {
    return this.http.post<Container>(`${environment.projectsApiUrl}/projects/${projectId}/container`, {});
  }

  getOwn(): Observable<Project[]> {
    return this.users.current$.pipe(
      switchMap(user => {
        if (!user || !user.id) {
          return of([]);
        }
        return this.http.get<Project[]>(`${environment.projectsApiUrl}/projects`, {
          params: {userId: user.id},
        });
      }),
      map(projects => [...this.localProjectService.getAll(), ...projects]),
    );
  }
}
