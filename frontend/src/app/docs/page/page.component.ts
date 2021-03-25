import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import hljs from 'highlight.js/lib/core';
import {switchMap} from 'rxjs/operators';
import {PageInfo} from '../docs.interface';
import {DocsService} from '../docs.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit, AfterViewChecked {
  @ViewChild('content') content: ElementRef<HTMLElement>;

  html = 'Loading...';
  subPages?: PageInfo[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private docsService: DocsService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({repo, page}) => this.docsService.getPage(repo, page)),
    ).subscribe(({html, subPages}) => {
      this.html = html;
      this.subPages = subPages;
    });
  }

  ngAfterViewChecked() {
    this.content.nativeElement.querySelectorAll('pre code').forEach(codeBlock => {
      if (!codeBlock.classList.contains('hljs')) {
        hljs.highlightElement(codeBlock);
      }
    });
  }

  onClick($event: MouseEvent) {
    if (!($event.target instanceof HTMLAnchorElement)) {
      return;
    }

    const target = $event.target as HTMLAnchorElement;
    const pathname = target.pathname;
    if (!pathname.startsWith('/docs/')) {
      return;
    }

    this.router.navigate([pathname]);
    $event.preventDefault();
  }
}
