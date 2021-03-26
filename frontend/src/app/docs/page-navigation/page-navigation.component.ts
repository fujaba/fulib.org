import {Component, Input, TrackByFunction} from '@angular/core';
import {Page} from '../docs.interface';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
})
export class PageNavigationComponent {
  @Input() page: Page;

  pageUrl: TrackByFunction<Page> = (_, p) => p.url;
}
