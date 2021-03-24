import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DocsService {
  readonly repos = [
    {
      name: 'fulib',
      description: 'A library that provides code generation for UML like models and some model management functionalities.',
    },
    {
      name: 'fulibScenarios',
      description: 'A language and compiler for textual example scenarios.',
    },
  ];

  constructor(
    private http: HttpClient,
  ) {
  }

  getPage(repo: string, page: string): Observable<string> {
    if (!page.endsWith('.md')) {
      page += '.md';
    }
    return this.http.get(`https://raw.githubusercontent.com/fujaba/${repo}/master/${page}`, {responseType: 'text'}).pipe(
      switchMap(text => this.http.post(environment.apiURL + '/rendermarkdown', text, {
        responseType: 'text',
        params: {
          image_base_url: `https://github.com/fujaba/${repo}/raw/master/`,
          // link_base_url: `https://github.com/fujaba/${repo}/tree/master/`,
          link_base_url: '/docs/' + repo + '/',
        },
      })),
    );
  }
}
