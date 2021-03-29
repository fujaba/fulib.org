import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {ParsedPage, RenderedPage} from '../docs.interface';
import {DocsService} from '../docs.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit {
  repo;
  page?: RenderedPage;
  rootPage?: ParsedPage;

  constructor(
    private activatedRoute: ActivatedRoute,
    private docsService: DocsService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      tap(({repo}) => this.repo = this.docsService.repos.find(r => r.name === repo)),
      switchMap(({repo, page}) => {
        const mainPage = page;
        const parentPages: string[] = [];
        for (let index = 0; 0 <= index && index < page.length; index = page.indexOf('/', index + 1)) {
          parentPages.push(index === 0 ? 'README.md' : page.substring(0, index + 1) + 'README.md');
        }
        if (parentPages[parentPages.length - 1] === mainPage) {
          parentPages.pop();
        }
        return forkJoin([
          ...parentPages.map(parentPage => this.docsService.getPageInfo(repo, parentPage)),
          this.docsService.getPage(repo, mainPage),
        ]);
      }),
    ).subscribe(pages => {
      this.page = pages[pages.length - 1] as RenderedPage;
      this.rootPage = pages[0];
      for (let i = 1; i < pages.length; i++) {
        const parent = pages[i - 1];
        const child = pages[i];
        if (parent.children) {
          const index = parent.children.findIndex(c => c.url === child.url);
          if (index >= 0) {
            parent.children[index] = child;
          }
        }
      }
    });
  }
}
