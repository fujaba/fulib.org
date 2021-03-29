import {Component, Input, TrackByFunction} from '@angular/core';
import {ParsedPage} from '../docs.interface';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
})
export class PageNavigationComponent {
  @Input() page: ParsedPage;

  pageUrl: TrackByFunction<ParsedPage> = (_, p) => p.url;
}
