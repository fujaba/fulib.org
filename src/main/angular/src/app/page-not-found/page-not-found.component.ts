import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {
  path: string;

  constructor(
    router: Router,
    title: Title,
    private location: Location,
  ) {
    this.path = router.url;
    title.setTitle('404 - Page not found');
  }

  goBack(): void {
    this.location.back();
  }
}
