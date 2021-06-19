import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {forkJoin, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {ProjectConfig} from '../model/project-config';
import {UserService} from '../user/user.service';
import {DavClient} from './dav-client';
import {LocalProjectService} from './local-project.service';
import {Container} from './model/container';
import {LocalProject, Project, ProjectStub, UserProject} from './model/project';
import {SetupService} from './setup/setup.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {

  constructor(
    private users: UserService,
    private http: HttpClient,
    private localProjectService: LocalProjectService,
    private setupService: SetupService,
    private davClient: DavClient,
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

  delete({id, local}: { id: string, local?: boolean }): Observable<void> {
    this.localProjectService.delete(id);
    return local ? of(undefined) : this.http.delete<void>(`${environment.projectsApiUrl}/projects/${id}`);
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

  restoreSetupAndFiles(container: Container, project: Project): Observable<any> {
    const config = this.localProjectService.getConfig(project.id);
    if (config) {
      return this.setupService.generateFiles(container, config).pipe(
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
