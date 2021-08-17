import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import {map, mapTo, switchMap} from 'rxjs/operators';
import {DavClient} from './dav-client';
import {Container} from '../model/container';

@Injectable()
export class ConfigService {
  constructor(
    private http: HttpClient,
    private dav: DavClient,
  ) {
  }

  private getUrl(container: Container, namespace: string, id?: string) {
    return `${container.url}/dav/projects/${container.projectId}/.fulib/${namespace}/${id ? id + '.json' : ''}`;
  }

  getObjects<T>(container: Container, namespace: string): Observable<T[]> {
    return this.dav.propFindAll(this.getUrl(container, namespace)).pipe(
      map(resources => resources.slice(1).map(({href}) => {
        const start = href.lastIndexOf('/') + 1;
        const end = href.length - (href.endsWith('.json') ? 5 : 0);
        return href.substring(start, end);
      })),
      switchMap(ids => forkJoin(ids.map(id => this.getObject<T>(container, namespace, id)))),
    );
  }

  getObject<T>(container: Container, namespace: string, id: string): Observable<T> {
    return this.http.get<T>(this.getUrl(container, namespace, id));
  }

  putObject<T extends { id: string }>(container: Container, namespace: string, obj: T): Observable<void> {
    return this.http.put(this.getUrl(container, namespace, obj.id), obj, {
      responseType: 'text',
    }).pipe(mapTo(undefined));
  }

  deleteObject<T extends { id: string }>(container: Container, namespace: string, obj: T): Observable<void> {
    return this.http.delete<void>(this.getUrl(container, namespace, obj.id));
  }
}
