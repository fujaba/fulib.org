import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Repository<//
  /** type of the entity */
  T,
  /** parent ID */
  PARENTID = never,
  /** unique ID */
  ID = string,
  /** filter */
  FILTER = never,
  /** create DTO */
  CDTO = T,
  /** update DTO */
  UDTO = CDTO,
  /** patch DTO */
  PDTO = Partial<UDTO>,
  > {
  findAll(parent: PARENTID, filter?: FILTER): Observable<T[]>; // TODO filter

  findOne(parent: PARENTID, id: ID): Observable<T>;

  create(parent: PARENTID, dto: CDTO): Observable<T>;

  update(parent: PARENTID, id: ID, dto: UDTO): Observable<T>;

  patch(parent: PARENTID, id: ID, dto: PDTO): Observable<T>;

  delete(parent: PARENTID, id: ID): Observable<T>;
}

export class HttpRepository<T, PARENTID, ID = string, FILTER = never, CDTO = T, UDTO = CDTO, PDTO = Partial<UDTO>> implements Repository<T, PARENTID, ID, FILTER, CDTO, UDTO, PDTO> {
  constructor(
    protected http: HttpClient,
    protected urlBuilder: (parent: PARENTID, id?: ID) => string,
  ) {
  }

  getHeaders(parent: PARENTID, id?: ID): Record<string, string | string[]> {
    return {};
  }

  create(parent: PARENTID, item: CDTO): Observable<T> {
    return this.http.post<T>(this.urlBuilder(parent), item, {headers: this.getHeaders(parent)});
  }

  findAll(parent: PARENTID, filter?: FILTER): Observable<T[]> {
    return this.http.get<T[]>(this.urlBuilder(parent), {headers: this.getHeaders(parent), params: filter as any});
  }

  findOne(parent: PARENTID, id: ID): Observable<T> {
    return this.http.get<T>(this.urlBuilder(parent, id), {headers: this.getHeaders(parent)});
  }

  update(parent: PARENTID, id: ID, item: UDTO): Observable<T> {
    return this.http.put<T>(this.urlBuilder(parent, id), item, {headers: this.getHeaders(parent)});
  }

  patch(parent: PARENTID, id: ID, item: PDTO): Observable<T> {
    return this.http.patch<T>(this.urlBuilder(parent, id), item, {headers: this.getHeaders(parent)});
  }

  delete(parent: PARENTID, id: ID): Observable<T> {
    return this.http.delete<T>(this.urlBuilder(parent, id), {headers: this.getHeaders(parent)});
  }
}
