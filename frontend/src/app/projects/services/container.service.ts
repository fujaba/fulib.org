import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Container} from '../model/container';
import {LocalProject} from '../model/project';

@Injectable()
export class ContainerService {
  constructor(
    private http: HttpClient,
  ) {
  }

  get(projectId: string): Observable<Container> {
    return this.http.get<Container>(`${environment.projectsApiUrl}/projects/${projectId}/container`);
  }

  create(projectId: string): Observable<Container> {
    return this.http.post<Container>(`${environment.projectsApiUrl}/projects/${projectId}/container`, {});
  }

  createLocal(localProject: LocalProject): Observable<Container> {
    const {id: projectId, dockerImage} = localProject;
    return this.http.post<Container>(`${environment.projectsApiUrl}/container`, {projectId, dockerImage});
  }

  delete(projectId: string): Observable<void> {
    return this.http.delete<void>(`${environment.projectsApiUrl}/projects/${projectId}/container`);
  }
}
