import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ChangelogService} from '../changelog.service';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit, AfterViewInit {
  @ViewChild('changelogModal', {static: true}) changelogModal;

  changelog: string;

  constructor(
    private modalService: NgbModal,
    private changelogService: ChangelogService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadChangelog();
    this.updateLastUsedVersion();
  }

  private loadChangelog() {
    const lastUsedVersions = this.changelogService.lastUsedVersions;
    if (!lastUsedVersions) {
      // never used the website before, they probably don't care about the changelogs
      return;
    }

    const lastUsedVersion = lastUsedVersions['fulib.org'];
    if (!lastUsedVersion) {
      // probably a dev server where versions are not injected; don't show the changelog
      return;
    }

    this.changelogService.getChangelog('fulib.org', lastUsedVersion).subscribe(changelog => {
      this.changelog = changelog;
      this.modalService.open(this.changelogModal, {ariaLabelledBy: 'changelogModalLabel', size: 'xl'});
    });
  }

  private updateLastUsedVersion() {
    this.changelogService.lastUsedVersions = this.changelogService.currentVersions;
  }
}
