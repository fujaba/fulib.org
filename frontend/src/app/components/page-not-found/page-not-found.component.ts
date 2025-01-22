import {Component} from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  standalone: false,
})
export class PageNotFoundComponent {
  path: string;

  constructor(
    private location: Location,
  ) {
    this.path = location.path();
  }

  goBack(): void {
    this.location.back();
  }
}
