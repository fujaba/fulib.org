import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Container} from '../model/container';
import {SearchResult} from '../model/search-result';

@Injectable()
export class SearchService {
  constructor(
    private http: HttpClient,
  ) {
  }

  search(container: Container, path: string, term: string, depth?: number, limit?: number): Observable<SearchResult[]> {
    const params: Record<string, string> = {
      q: term,
    };
    if (depth) {
      params.depth = depth.toString();
    }
    if (limit) {
      params.limit = limit.toString();
    }
    return this.http.get<SearchResult[]>(container.url + '/search' + path, {params});
  }
}
