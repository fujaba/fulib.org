import {Component, Input} from '@angular/core';
import {ActivatedRoute, Route} from '@angular/router';

@Component({
  selector: 'app-route-tabs',
  templateUrl: './route-tabs.component.html',
  styleUrls: ['./route-tabs.component.scss'],
})
export class RouteTabsComponent {
  @Input() routes: Route[];

  constructor(
    public route: ActivatedRoute,
  ) {
  }
}
