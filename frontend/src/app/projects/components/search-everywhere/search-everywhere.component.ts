import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-search-everywhere',
  templateUrl: './search-everywhere.component.html',
  styleUrls: ['./search-everywhere.component.scss'],
})
export class SearchEverywhereComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
  }

}
