import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from 'keycloak-angular';
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
    private keycloak: KeycloakService,
  ) {
  }

  menuCollapsed = true;

  repos?: (keyof Versions)[];
  versions?: Versions;
  showChangelog = false;

  username?: string;

  ngOnInit(): void {
    this.keycloak.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.username = this.keycloak.getUsername();
      }
    });

    this.repos = this.changelogService.repos;
    this.changelogService.getCurrentVersions().subscribe(currentVersions => {
      this.versions = currentVersions;
      if (this.changelogService.autoShow) {
        const lastUsedVersions = this.changelogService.lastUsedVersions;
        if (lastUsedVersions) {
          const newVersions = this.changelogService.getVersionDiff(lastUsedVersions, currentVersions);
          if (Object.keys(newVersions).length) {
            this.showChangelog = true;
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.privacyService.privacy === null) {
      this.router.navigate([{outlets: {modal: 'privacy'}}], {relativeTo: this.route});
    } else if (this.showChangelog) {
      this.router.navigate([{outlets: {modal: 'changelog'}}], {relativeTo: this.route});
    }
  }

  login(): void {
    this.keycloak.login().then(() => {
    });
  }

  logout(): void {
    this.keycloak.logout().then(() => {
    });
  }
}
