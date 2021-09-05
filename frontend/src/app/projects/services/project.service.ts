import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {forkJoin, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {environment} from '../../../environments/environment';
import {ConfigService as EditorConfigService} from '../../editor/config.service';
import {ProjectConfig} from '../../model/project-config';
import {UserService} from '../../user/user.service';
import {DavClient} from './dav-client';
import {LocalProjectService} from './local-project.service';
import {Container} from '../model/container';
import {LocalProject, Project, ProjectStub, UserProject} from '../model/project';

@Injectable()
export class ProjectService {

  constructor(
    private users: UserService,
    private http: HttpClient,
    private localProjectService: LocalProjectService,
    private davClient: DavClient,
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
    const { packageName, projectName, projectVersion, scenarioFileName, decoratorClassName, storedScenario } = this.configService;
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
    return this.http.put<Project>(`${environment.projectsApiUrl}/projects/${project.id}`, project);
  }

  transfer(id: string, userId: string): Observable<void> {
    return this.http.put<void>(`${environment.projectsApiUrl}/projects/${id}`, {userId});
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
      switchMap(zipBlob => this.http.post<void>(`${container.url}/zip//projects/${container.projectId}`, zipBlob)),
    );
  }

  restoreSetupAndFiles(container: Container, project: Project): Observable<any> {
    const config = this.localProjectService.getConfig(project.id);
    if (config) {
      return this.generateFiles(container, config).pipe(
        tap(() => {
          if (!project.local) {
            this.localProjectService.deleteConfig(project.id);
          }
        }),
        switchMap(() => this.restoreFiles(project, container)),
      );
    }
    return this.restoreFiles(project, container);
  }

  private restoreFiles(project: Project, container: Container): Observable<any> {
    const files = this.localProjectService.getFiles(project.id);
    if (files.length === 0) {
      return of(undefined);
    }
    return forkJoin(files.map(path => this.restoreFile(project, container, path)));
  }

  private restoreFile(project: Project, container: Container, path: string): Observable<any> {
    const content = this.localProjectService.getFile(project.id, path);
    if (content === null) {
      return of(undefined);
    }
    return this.davClient.put(`${container.url}/dav/${path}`, content).pipe(
      tap(() => {
        if (!project.local) {
          this.localProjectService.deleteFile(project.id, path);
        }
      }),
    );
  }
}
