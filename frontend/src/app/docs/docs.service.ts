import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Page} from './docs.interface';

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

  getPage(repo: string, url: string): Observable<Page> {
    const parent = url.substring(0, url.lastIndexOf('/') + 1);
    return this.getRawPage(repo, url).pipe(
      switchMap(source => {
        const page = this.parsePage(url, source);
        return this.render(repo, parent, page.html!).pipe(map(html => {
          page.html = html;
          return page;
        }));
      }),
    );
  }

  getPageInfo(repo: string, url: string): Observable<Page> {
    return this.getRawPage(repo, url).pipe(map(source => this.parsePage(url, source)));
  }

  private render(repo: string, parent: string, text: string) {
    return this.http.post(environment.apiURL + '/rendermarkdown', text, {
      responseType: 'text',
      params: {
        image_base_url: `https://github.com/fujaba/${repo}/raw/master/docs/${parent}`,
        link_base_url: `/docs/${repo}/${parent}`,
      },
    });
  }

  private parsePage(url: string, source: string): Page {
    const children: Page[] = [];
    const titleMatch = source.match(/^#\s*(.*)(\s+\[WIP])?$/m);
    const title = titleMatch?.[1] ?? '';
    const wip = !!titleMatch?.[2];
    const html = source.replace(/^\* \[(.*?)(\s+\\\[WIP\\])?]\((.*)\)$/gm, (s, childTitle, childWip, childUrl) => {
      children.push({title: childTitle, wip: !!childWip, url: childUrl});
      return '';
    });
    return {title, url, wip, html, children};
  }

  private getRawPage(repo: string, page: string) {
    if (!page.endsWith('.md')) {
      page += '/README.md';
    }
    return this.http.get(`https://raw.githubusercontent.com/fujaba/${repo}/master/docs/${page}`, {responseType: 'text'});
  }
}
