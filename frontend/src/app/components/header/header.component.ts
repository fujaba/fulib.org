import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ThemeService} from '@mean-stream/ngbx';
import {KeycloakService} from 'keycloak-angular';
import {environment} from '../../../environments/environment';
import {ChangelogService, REPOS, Versions} from '../../services/changelog.service';

import {PrivacyService} from '../../services/privacy.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, AfterViewInit {
  menuCollapsed = true;

  readonly repos = REPOS;
  versions?: Versions;

  username?: string;
  accountUrl?: string = environment.auth ? `${environment.auth.url}/realms/${environment.auth.realm}/account` : undefined;

  selectedTheme = this.themeService.theme;

  themes = [
    {name: 'Sync with OS', value: 'auto', icon: 'bi-circle-half', selectedIcon: 'bi-check-circle-fill'},
    {name: 'Light', value: 'light', icon: 'bi-sun', selectedIcon: 'bi-sun-fill'},
    {name: 'Dark', value: 'dark', icon: 'bi-moon-stars', selectedIcon: 'bi-moon-stars-fill'},
  ];

  constructor(
    private themeService: ThemeService,
    private privacyService: PrivacyService,
    private changelogService: ChangelogService,
    private router: Router,
    private route: ActivatedRoute,
    private keycloak: KeycloakService,
  ) {
  }

  ngOnInit(): void {
    if (this.keycloak.isLoggedIn()) {
      this.keycloak.loadUserProfile().then(profile => {
        this.username = profile.username;
      });
    }

    this.changelogService.getCurrentVersions().subscribe(currentVersions => {
      this.versions = currentVersions;
      if (this.changelogService.autoShow) {
        const lastUsedVersions = this.changelogService.lastUsedVersions;
        if (lastUsedVersions) {
          const strippedVersions = this.changelogService.stripBuildSuffix(currentVersions);
          const newVersions = this.changelogService.getVersionDiff(lastUsedVersions, strippedVersions);
          if (Object.keys(newVersions).length) {
            this.router.navigate([{outlets: {modal: 'changelog'}}], {relativeTo: this.route});
          }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.privacyService.privacy === null) {
      this.router.navigate([{outlets: {modal: 'privacy'}}], {relativeTo: this.route});
    }
  }

  login(): void {
    this.keycloak.login().then();
  }

  logout(): void {
    this.keycloak.logout().then();
  }

  selectTheme(value: string) {
    this.selectedTheme = value;
    this.themeService.theme = value;
  }
}
