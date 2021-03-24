import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
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
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      switchMap(({repo, page}) => this.docsService.getPage(repo, page)),
    ).subscribe(content => {
      this.html = content;
    });
  }

}
