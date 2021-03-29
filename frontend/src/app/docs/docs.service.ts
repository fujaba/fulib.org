import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Page, ParsedPage, RenderedPage} from './docs.interface';

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

  getPage(repo: string, url: string): Observable<RenderedPage> {
    const parent = url.substring(0, url.lastIndexOf('/') + 1);
    return this.getRawPage(repo, url).pipe(
      switchMap(source => {
        const page = this.parsePage(repo, url, source);
        return this.render(repo, parent, page.markdown!).pipe(map(html => {
          const rendered: RenderedPage = {...page, html};
          return rendered;
        }));
      }),
    );
  }

  getPageInfo(repo: string, url: string): Observable<ParsedPage> {
    return this.getRawPage(repo, url).pipe(map(source => this.parsePage(repo, url, source)));
  }

  private render(repo: string, parent: string, text: string): Observable<string> {
    return this.http.post(environment.apiURL + '/rendermarkdown', text, {
      responseType: 'text',
      params: {
        image_base_url: `https://github.com/fujaba/${repo}/raw/master/docs/${parent}`,
        link_base_url: `/docs/${repo}/${parent}`,
      },
    });
  }

  private parsePage(repo: string, url: string, source: string): ParsedPage {
    const children: Page[] = [];
    const titleMatch = source.match(/^#\s*(.*?)(\s+\\\[WIP\\])?$/m);
    const title = titleMatch?.[1] ?? '';
    const wip = !!titleMatch?.[2];
    const parentUrl = url.substring(0, url.lastIndexOf('/') + 1);
    const markdown = source.replace(/^\* \[(.*?)(\s+\\\[WIP\\])?]\((.*)\)$/gm, (s, childTitle, childWip, childUrl) => {
      children.push({title: childTitle, repo, wip: !!childWip, url: parentUrl + childUrl});
      return '';
    });
    return {title, repo, url, wip, markdown, children};
  }

  private getRawPage(repo: string, page: string): Observable<string> {
    return this.http.get(`https://raw.githubusercontent.com/fujaba/${repo}/master/docs/${page}`, {responseType: 'text'});
  }
}
