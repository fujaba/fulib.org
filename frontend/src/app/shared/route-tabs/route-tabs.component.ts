import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Route} from '@angular/router';

@Component({
  selector: 'app-route-tabs',
  templateUrl: './route-tabs.component.html',
  styleUrls: ['./route-tabs.component.scss'],
})
export class RouteTabsComponent implements OnInit {
  @Input() routes: Route[];

  constructor(
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
  }
}
