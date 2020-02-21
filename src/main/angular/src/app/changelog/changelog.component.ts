import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ChangelogService, Versions} from '../changelog.service';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss']
})
export class ChangelogComponent implements OnInit, AfterViewInit {
  @ViewChild('changelogModal', {static: true}) changelogModal;

  lastUsedVersions: Versions;
  private _changelogs = new Versions();

  constructor(
    private modalService: NgbModal,
    private changelogService: ChangelogService,
  ) { }

  ngOnInit() {
    this.lastUsedVersions = this.changelogService.lastUsedVersions;
  }

  ngAfterViewInit() {
    this.loadChangelog();
    this.updateLastUsedVersion();
  }

  private loadChangelog() {
    const lastUsedVersions = this.lastUsedVersions;
    if (!lastUsedVersions) {
      // never used the website before, they probably don't care about the changelogs
      return;
    }

    const keys = Object.keys(lastUsedVersions) as (keyof Versions)[];
    for (const key of keys) {
      const lastUsedVersion = lastUsedVersions[key];
      if (!lastUsedVersion) {
        // probably a dev server where versions are not injected; don't show the changelog
        continue;
      }

      this._changelogs[key] = '';
      this.changelogService.getChangelog(key, lastUsedVersion).subscribe(changelog => {
        this._changelogs[key] = changelog;
        this.modalService.open(this.changelogModal, {ariaLabelledBy: 'changelogModalLabel', size: 'xl'});
      });
    }
  }

  get changelogs(): {repo: string, changelog: string}[] {
    return Object.keys(this._changelogs)
      .filter(repo => this._changelogs[repo])
      .map(repo => ({
        repo,
        changelog: this._changelogs[repo],
      }));
  }

  private updateLastUsedVersion() {
    this.changelogService.lastUsedVersions = this.changelogService.currentVersions;
  }
}
