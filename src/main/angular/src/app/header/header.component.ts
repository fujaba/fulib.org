import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ChangelogService, Versions} from '../changelog.service';

import {PrivacyService} from '../privacy.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  constructor(
    private privacyService: PrivacyService,
    private changelogService: ChangelogService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  menuCollapsed = true;

  repos?: (keyof Versions)[];
  versions?: Versions;

  ngOnInit(): void {
    this.repos = this.changelogService.repos;
    this.versions = this.changelogService.currentVersions;
  }

  ngAfterViewInit(): void {
    if (this.privacyService.privacy === null) {
      this.router.navigate([{outlets: {modal: 'privacy'}}], {relativeTo: this.route});
    } else if (this.changelogService.autoShow && Object.keys(this.changelogService.newVersions).length) {
      this.router.navigate([{outlets: {modal: 'changelog'}}], {relativeTo: this.route});
    }
  }
}
