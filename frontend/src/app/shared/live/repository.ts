import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Resource {
  parent: any;
  id: any;
  type: any;
  filter: any;
  create: any;
  update: any;
  patch: any;
  event: any;
}

export interface Repository<R extends Resource> {
  findAll(parent: R['parent'], filter?: R['filter']): Observable<R['type'][]>;

  findOne(parent: R['parent'], id: R['id']): Observable<R['type']>;

  create(parent: R['parent'], dto: R['create']): Observable<R['type']>;

  update(parent: R['parent'], id: R['id'], dto: R['update']): Observable<R['type']>;

  patch(parent: R['parent'], id: R['id'], dto: R['patch']): Observable<R['type']>;

  delete(parent: R['parent'], id: R['id']): Observable<R['type']>;
}

export class HttpRepository<R extends Resource> implements Repository<R> {
  constructor(
    protected http: HttpClient,
    protected urlBuilder: (parent: R['parent'], id?: R['id']) => string,
  ) {
  }

  getHeaders(parent: R['parent'], id?: R['id']): Record<string, string | string[]> {
    return {};
  }

  create(parent: R['parent'], item: R['create']): Observable<R['type']> {
    return this.http.post<R['type']>(this.urlBuilder(parent), item, {headers: this.getHeaders(parent)});
  }

  findAll(parent: R['parent'], filter?: R['filter']): Observable<R['type'][]> {
    return this.http.get<R['type'][]>(this.urlBuilder(parent), {headers: this.getHeaders(parent), params: filter as any});
  }

  findOne(parent: R['parent'], id: R['id']): Observable<R['type']> {
    return this.http.get<R['type']>(this.urlBuilder(parent, id), {headers: this.getHeaders(parent)});
  }

  update(parent: R['parent'], id: R['id'], item: R['update']): Observable<R['type']> {
    return this.http.put<R['type']>(this.urlBuilder(parent, id), item, {headers: this.getHeaders(parent)});
  }

  patch(parent: R['parent'], id: R['id'], item: R['patch']): Observable<R['type']> {
    return this.http.patch<R['type']>(this.urlBuilder(parent, id), item, {headers: this.getHeaders(parent)});
  }

  delete(parent: R['parent'], id: R['id']): Observable<R['type']> {
    return this.http.delete<R['type']>(this.urlBuilder(parent, id), {headers: this.getHeaders(parent)});
  }
}
