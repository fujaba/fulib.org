import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {environment} from '../../../environments/environment';
import {ConfigService as EditorConfigService} from '../../editor/config.service';
import {ProjectConfig} from '../../shared/model/project-config';
import {UserService} from '../../user/user.service';
import {Container} from '../model/container';
import {LocalProject, Project, ProjectStub, UserProject} from '../model/project';
import {LocalProjectService} from './local-project.service';

@Injectable()
export class ProjectService {

  constructor(
    private users: UserService,
    private http: HttpClient,
    private localProjectService: LocalProjectService,
    private configService: EditorConfigService,
  ) {
  }


  create(stub: ProjectStub): Observable<Project> {
    if (stub.local) {
      return of(this.localProjectService.create(stub));
    }
    return this.createPersistent(stub);
  }

  private createPersistent(stub: ProjectStub): Observable<UserProject> {
    return this.http.post<UserProject>(`${environment.projectsApiUrl}/projects`, stub);
  }

  setupFromEditor(id: string) {
    const {
      packageName,
      projectName,
      projectVersion,
      scenarioFileName,
      decoratorClassName,
      storedScenario,
    } = this.configService;
    this.localProjectService.saveConfig(id, {
      packageName,
      projectName,
      projectVersion,
      scenarioFileName,
      decoratorClassName,
    });
    const packagePath = packageName.replace(/\./g, '/');
    const scenarioFilePath = `/projects/${id}/src/main/scenarios/${packagePath}/${scenarioFileName}`;
    this.localProjectService.saveFile(id, scenarioFilePath, storedScenario);
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
    return this.http.patch<Project>(`${environment.projectsApiUrl}/projects/${project.id}`, project);
  }

  transfer(id: string, userId: string): Observable<void> {
    return this.http.patch<void>(`${environment.projectsApiUrl}/projects/${id}`, {userId});
  }

  delete({id, local}: { id: string, local?: boolean }): Observable<void> {
    this.localProjectService.delete(id);
    return local ? of(undefined) : this.http.delete<void>(`${environment.projectsApiUrl}/projects/${id}`);
  }

  getOwn(): Observable<Project[]> {
    return this.users.current$.pipe(
      switchMap(user => user ? this.http.get<Project[]>(`${environment.projectsApiUrl}/projects`) : of([])),
      map(projects => [...this.localProjectService.getAll(), ...projects]),
    );
  }

  saveConfig(project: Project, config: ProjectConfig): void {
    if (project.local) {
      this.localProjectService.saveConfig(project.id, config);
    }
  }

  convert(localProject: LocalProject): Observable<UserProject> {
    return this.createPersistent({...localProject, local: false}).pipe(
      tap(persistent => this.localProjectService.deleteAndChangeId(localProject.id, persistent.id)),
    );
  }

  generateFiles(container: Container, projectConfig: ProjectConfig): Observable<void> {
    return this.http.post(`${environment.apiURL}/projectzip`, projectConfig, {responseType: 'blob'}).pipe(
      switchMap((zipBlob) => {
        const formData = new FormData();
        const blob = new Blob([zipBlob]);
        formData.append('file', blob);
        return this.http.post<void>(`${environment.projectsApiUrl}/projects/${container.projectId}/zip`, formData);
      }),
    );
  }
}
