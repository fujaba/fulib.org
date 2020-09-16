import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {Privacy, PrivacyService} from '../privacy.service';
import {ChangelogService, Versions} from '../changelog.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, AfterViewInit {
  constructor(
    public readonly modalService: NgbModal,
    private privacyService: PrivacyService,
    private changelogService: ChangelogService,
  ) {
  }

  @ViewChild('privacyModal', {static: false}) privacyModal;

  privacy: Privacy;

  menuCollapsed = true;

  repos?: (keyof Versions)[];
  versions?: Versions;

  ngOnInit(): void {
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
    this.modalService.open(this.privacyModal, {ariaLabelledBy: 'privacyModalLabel'});
  }

  loadPrivacy(): void {
    this.privacy = this.privacyService.privacy ?? 'none';
  }

  savePrivacy(): void {
    this.privacyService.privacy = this.privacy;
  }
}
