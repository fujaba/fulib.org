import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {DocsService} from '../docs.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {
  html = 'Loading...';

  constructor(
    private activatedRoute: ActivatedRoute,
    private docsService: DocsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({repo, page}) => this.docsService.getPage(repo, page)),
    ).subscribe(content => {
      this.html = content;
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
