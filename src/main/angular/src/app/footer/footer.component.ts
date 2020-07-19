import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {Privacy, PrivacyService} from "../privacy.service";
import {ChangelogService, Versions} from '../changelog.service';
import {KeycloakService} from "keycloak-angular";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, AfterViewInit {
  constructor(
    public readonly modalService: NgbModal,
    private privacyService: PrivacyService,
    private changelogService: ChangelogService,
    private keycloak: KeycloakService,
  ) {
  }

  @ViewChild('privacyModal', {static: false}) privacyModal;

  privacy: Privacy;
  contactEmail = 'spam@fbi.gov'.replace('spam', 'contact').replace('fbi.gov', 'fulib.org');

  menuCollapsed = true;

  username: string;

  repos?: (keyof Versions)[];
  versions?: Versions;

  ngOnInit(): void {
    this.keycloak.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.username = this.keycloak.getUsername();
      }
    });
    this.repos = this.changelogService.repos;
    this.versions = this.changelogService.currentVersions;
    this.loadPrivacy();
  }

  ngAfterViewInit(): void {
    if (this.privacyService.privacy === null) {
      this.openPrivacyModal();
    }
  }

  openPrivacyModal(): void {
    this.modalService.open(this.privacyModal, {ariaLabelledBy: 'privacyModalLabel'})
  }

  loadPrivacy(): void {
    this.privacy = this.privacyService.privacy || 'none';
  }

  savePrivacy(): void {
    this.privacyService.privacy = this.privacy;
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
