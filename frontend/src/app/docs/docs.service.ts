import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Page, ParsedPage, RenderedPage, Repository} from './docs.interface';

@Injectable({
  providedIn: 'root',
})
export class DocsService {
  constructor(
    private http: HttpClient,
  ) {
  }

  getRepos(): Observable<Repository[]> {
    return this.http.get<any[]>('https://api.github.com/orgs/fujaba/repos', {
      params: {
        type: 'public',
        sort: 'full_name',
      },
    }).pipe(map(repos => repos.filter(r => r.has_pages && r.name.startsWith('fulib') && r.description).map(r => this.toRepository(r))));
  }

  getRepo(name: string): Observable<Repository> {
    return this.http.get<any>(`https://api.github.com/repos/fujaba/${name}`).pipe(map(r => this.toRepository(r)));
  }

  private toRepository(r: any): Repository {
    return {
      name: r.name,
      description: r.description,
    };
  }

  getPage(repo: string, url: string): Observable<RenderedPage> {
    return this.getPageInfo(repo, url).pipe(switchMap(page => this.render(page)));
  }

  getPageInfo(repo: string, url: string): Observable<ParsedPage> {
    return this.getRawPage(repo, url).pipe(map(source => this.parsePage(repo, url, source)));
  }

  private render(page: ParsedPage): Observable<RenderedPage> {
    const parent = page.url.substring(0, page.url.lastIndexOf('/') + 1);
    return this.http.post(environment.apiURL + '/rendermarkdown', page.markdown, {
      responseType: 'text',
      params: {
        image_base_url: `https://github.com/fujaba/${page.repo}/raw/master/docs/${parent}`,
        link_base_url: `/docs/${page.repo}/${parent}`,
      },
    }).pipe(map(html => ({...page, html})));
  }

  private parsePage(repo: string, url: string, source: string): ParsedPage {
    const children: Page[] = [];
    const titleMatch = source.match(/^#\s*(.*?)(\s+\\\[WIP\\])?$/m);
    const title = titleMatch?.[1] ?? '';
    const wip = !!titleMatch?.[2];
    const parentUrl = url.substring(0, url.lastIndexOf('/') + 1);
    const markdown = source.replace(/^(?:\d+\.|[+*-]) \[(.*?)(\s+\\\[WIP\\])?]\((.*)\)$/gm, (s, childTitle, childWip, childUrl) => {
      children.push({title: childTitle, repo, wip: !!childWip, url: parentUrl + childUrl});
      return '';
    });
    return {title, repo, url, wip, markdown, children};
  }

  private getRawPage(repo: string, page: string): Observable<string> {
    return this.http.get(`https://api.github.com/repos/fujaba/${repo}/contents/docs/${page}`, {
      responseType: 'text',
      headers: {
        Accept: 'application/vnd.github.raw',
      },
    });
  }
}
