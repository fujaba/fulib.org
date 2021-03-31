import {Component, OnInit} from '@angular/core';
import {Repository} from '../docs.interface';
import {DocsService} from '../docs.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  repos?: Repository[];

  constructor(
    private docsService: DocsService,
  ) {
  }

  ngOnInit(): void {
    this.docsService.getRepos().subscribe(repos => {
      this.repos = repos;
    });
  }

}
