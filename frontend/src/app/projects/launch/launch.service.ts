import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {DavClient} from '../dav-client';
import {Container} from '../model/container';
import {LaunchConfig} from './model/launch-config';

@Injectable({providedIn: 'root'})
export class LaunchService {
  constructor(
    private http: HttpClient,
    private dav: DavClient,
  ) {
  }

  private getUrl(container: Container, id: string) {
    return `${container.url}/dav/projects/${container.projectId}/.fulib/launch/${id}`;
  }

  getLaunchConfigs(container: Container): Observable<LaunchConfig[]> {
    return this.dav.propFindChildren(this.getUrl(container, '')).pipe(
      map(resources => resources.map(resource => resource.href.substring(resource.href.lastIndexOf('/') + 1))),
      switchMap(ids => forkJoin(ids.map(id => this.getLaunchConfig(container, id)))),
    );
  }

  getLaunchConfig(container: Container, id: string): Observable<LaunchConfig> {
    return this.http.get<LaunchConfig>(this.getUrl(container, id));
  }

  saveLaunchConfig(container: Container, config: LaunchConfig): Observable<void> {
    return this.http.put<void>(this.getUrl(container, config.id), config);
  }
}
