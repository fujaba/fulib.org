import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {Page} from '../docs.interface';
import {DocsService} from '../docs.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit {
  html = 'Loading...';
  rootPage?: Page;

  constructor(
    private activatedRoute: ActivatedRoute,
    private docsService: DocsService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({repo, page}) => {
        const mainPage = page;
        const parentPages: string[] = [];
        for (let index = 0; 0 <= index && index < page.length; index = page.indexOf('/', index + 1)) {
          parentPages.push(page.substring(0, index));
        }
        return forkJoin([
          ...parentPages.map(parentPage => this.docsService.getPageInfo(repo, parentPage)),
          this.docsService.getPage(repo, mainPage),
        ]);
      }),
    ).subscribe(pages => {
      this.html = (pages[pages.length - 1] as Page).html!;
      this.rootPage = pages[0];
      for (let i = 1; i < pages.length; i++) {
        const parent = pages[i - 1];
        const child = pages[i];
        if (parent.children) {
          const index = parent.children.findIndex(c => c.title === child.title);
          if (index >= 0) {
            parent.children[index] = child;
          }
        }
      }
    });
  }
}
