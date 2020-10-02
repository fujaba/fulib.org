import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  constructor(
    private http: HttpClient,
  ) {
  }

  renderMarkdown(md: string): Observable<string> {
    return this.http.post(`${environment.apiURL}/rendermarkdown`, md, {responseType: 'text'});
  }
}
