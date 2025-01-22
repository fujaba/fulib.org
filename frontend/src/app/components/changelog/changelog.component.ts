import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SwUpdate} from '@angular/service-worker';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ChangelogService, Release, REPOS, Repository, Versions} from '../../services/changelog.service';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss'],
  standalone: false,
})
export class ChangelogComponent implements OnInit {
  readonly repos = REPOS;
  currentVersions: Versions;
  lastUsedVersions: Versions | null;
  changelogs: Partial<Record<Repository, Release[]>> = {};

  pwaUpdate = false;

  activeRepo: string;

  constructor(
    private modalService: NgbModal,
    private changelogService: ChangelogService,
    private swUpdate: SwUpdate,
    public route: ActivatedRoute,
  ) {
  }

  get autoShow(): boolean {
    return this.changelogService.autoShow;
  }

  set autoShow(value: boolean) {
    this.changelogService.autoShow = value;
  }

  ngOnInit(): void {
    this.swUpdate.checkForUpdate().then(update => this.pwaUpdate = update);

    this.lastUsedVersions = this.changelogService.lastUsedVersions;

    this.changelogService.getCurrentVersions().subscribe(currentVersions => {
      this.currentVersions = currentVersions;

      const strippedVersions = this.changelogService.stripBuildSuffix(currentVersions);
      if (!this.lastUsedVersions) {
        this.showAll();
        this.changelogService.lastUsedVersions = strippedVersions;
        return;
      }

      const newVersions = this.changelogService.getVersionDiff(this.lastUsedVersions, strippedVersions);
      const newRepos = Object.keys(newVersions) as (keyof Versions)[];
      if (newRepos.length === 0) {
        this.showAll();
      } else {
        this.showNewVersions(newRepos);
        this.changelogService.lastUsedVersions = strippedVersions;
      }
    });

  }

  private showAll() {
    this.activeRepo = this.repos[0];
    for (const repo of this.repos) {
      this.changelogs[repo] = [];
      this.changelogService.getChangelog(repo).subscribe(changelog => {
        this.changelogs[repo] = changelog;
      });
    }
  }

  private showNewVersions(newRepos: (keyof Versions)[]) {
    this.activeRepo = newRepos[0];
    for (const repo of newRepos) {
      this.changelogs[repo] = [];
      this.changelogService.getChangelog(repo, this.lastUsedVersions![repo], this.currentVersions[repo]).subscribe(changelog => {
        this.changelogs[repo] = changelog;
      });
    }
  }

  render(repo: Repository, release: Release) {
    if (release.bodyHtml) {
      return;
    }

    this.changelogService.renderChangelog(repo, release).subscribe();
  }

  reload() {
    document.location.reload();
  }
}
