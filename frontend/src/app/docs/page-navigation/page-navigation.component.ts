import {Component, Input, OnInit} from '@angular/core';
import {Page} from '../docs.interface';

@Component({
  selector: 'app-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss'],
})
export class PageNavigationComponent implements OnInit {
  @Input() page: Page;

  constructor() {
  }

  ngOnInit(): void {
  }
}
