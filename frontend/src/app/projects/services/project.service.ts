import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {environment} from '../../../environments/environment';
import {UserService} from '../../user/user.service';
import {CreateProjectDto, Project} from '../model/project';

@Injectable()
export class ProjectService {

  constructor(
    private users: UserService,
    private http: HttpClient,
  ) {
  }


  create(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(`${environment.projectsApiUrl}/projects`, dto);
  }

  get(id: string): Observable<Project> {
    return this.http.get<Project>(`${environment.projectsApiUrl}/projects/${id}`);
  }

  update(project: Project): Observable<Project> {
    return this.http.patch<Project>(`${environment.projectsApiUrl}/projects/${project.id}`, project);
  }

  transfer(id: string, userId: string): Observable<void> {
    return this.http.patch<void>(`${environment.projectsApiUrl}/projects/${id}`, {userId});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.projectsApiUrl}/projects/${id}`);
  }

  getOwn(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.projectsApiUrl}/projects`);
  }
}
