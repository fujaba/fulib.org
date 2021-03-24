import {Component, OnInit} from '@angular/core';
import {DocsService} from '../docs.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  repos = this.docsService.repos;

  constructor(
    private docsService: DocsService,
  ) {
  }

  ngOnInit(): void {
  }

}
