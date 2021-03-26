import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {PageInfo} from './docs.interface';

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

  getPage(repo: string, page: string): Observable<{ html: string, subPages: PageInfo[] }> {
    const parent = page.substring(0, page.lastIndexOf('/') + 1);
    return this.getRawPage(repo, page).pipe(
      switchMap(source => {
        const {text, subPages} = this.getSubPages(source);
        return this.render(repo, parent, text).pipe(map(html => ({html, subPages})));
      }),
    );
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

  private getSubPages(source: string): { text: string, subPages: PageInfo[] } {
    const subPages: PageInfo[] = [];
    const text = source.replace(/^\* \[(.*?)(\s+\\\[WIP\\])?]\((.*)\)$/gm, (s, title, wip, url) => {
      subPages.push({title, wip: !!wip, url});
      return '';
    });
    return {text, subPages};
  }

  private getRawPage(repo: string, page: string) {
    if (!page.endsWith('.md')) {
      page += '/README.md';
    }
    return this.http.get(`https://raw.githubusercontent.com/fujaba/${repo}/master/docs/${page}`, {responseType: 'text'});
  }
}
