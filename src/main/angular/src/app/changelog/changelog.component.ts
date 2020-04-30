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

  currentVersions: Versions;
  lastUsedVersions: Versions;
  private _changelogs = new Versions();

  activeRepo: string;

  constructor(
    private modalService: NgbModal,
    private changelogService: ChangelogService,
  ) { }

  get autoShow(): boolean {
    return this.changelogService.autoShow;
  }

  set autoShow(value: boolean) {
    this.changelogService.autoShow = value;
  }

  ngOnInit() {
    this.lastUsedVersions = this.changelogService.lastUsedVersions;
    this.currentVersions = this.changelogService.currentVersions;
  }

  ngAfterViewInit() {
    if (this.autoShow) {
      this.openFromLastUsedVersion();
      this.updateLastUsedVersion();
    }
  }

  private openFromLastUsedVersion() {
    const lastUsedVersions = this.lastUsedVersions;
    if (!lastUsedVersions) {
      // never used the website before, they probably don't care about the changelogs
      return;
    }

    const currentVersions = this.changelogService.currentVersions;

    let open = false;
    for (const repo of this.changelogService.repos) {
      const lastUsedVersion = lastUsedVersions[repo];
      if (!lastUsedVersion) {
        // probably a dev server where versions are not injected; don't show the changelog
        continue;
      }

      const currentVersion = currentVersions[repo];

      this._changelogs[repo] = '';
      this.changelogService.getChangelog(repo, lastUsedVersion, currentVersion).subscribe(changelog => {
        this._changelogs[repo] = changelog;

        if (!this.activeRepo) {
          this.activeRepo = repo;
        }

        if (!open) {
          open = true;
          this.openModal();
        }
      });
    }
  }

  private openModal() {
    this.modalService.open(this.changelogModal, {ariaLabelledBy: 'changelogModalLabel', size: 'xl'});
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

  open(): void {
    const repos = this.changelogService.repos;
    this.activeRepo = repos[0];

    this.openModal();

    for (const repo of repos) {
      this._changelogs[repo] = '';
      this.changelogService.getChangelog(repo).subscribe(changelog => {
        this._changelogs[repo] = changelog;
      });
    }
  }
}
