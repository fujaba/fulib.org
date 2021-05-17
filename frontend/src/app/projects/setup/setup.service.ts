import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {ProjectConfig} from '../../model/project-config';
import {Container} from '../model/container';
import {Project} from '../model/project';

@Injectable({providedIn: 'root'})
export class SetupService {
  constructor(
    private http: HttpClient,
  ) {
  }

  getDefaultConfig(project: Project): ProjectConfig {
    const projectSlug = project.name.replace(/\W+/, '-').toLowerCase();
    return {
      projectName: projectSlug,
      packageName: 'org.example',
      projectVersion: '0.1.0',
      scenarioFileName: 'Scenario.md',
      decoratorClassName: 'GenModel',
    };
  }

  generateFiles(container: Container, projectConfig: ProjectConfig): Observable<void> {
    return this.http.post(`${environment.projectsApiUrl}/projectzip`, projectConfig, {responseType: 'blob'}).pipe(
      switchMap(zipBlob => this.http.post<void>(`${container.url}/zip//projects/${container.projectId}`, zipBlob)),
    );
  }
}
