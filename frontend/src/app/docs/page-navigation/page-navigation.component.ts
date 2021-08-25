import {Component, Input, TrackByFunction} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Page} from '../docs.interface';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
})
export class PageNavigationComponent {
  @Input() page: Page;

  constructor(
    public route: ActivatedRoute,
  ) {
  }

  pageUrl: TrackByFunction<Page> = (_, p) => p.url;
}
