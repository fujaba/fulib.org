import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ChangelogService, Versions} from '../changelog.service';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.scss'],
})
export class ChangelogComponent implements OnInit {
  repos: (keyof Versions)[] = [];
  currentVersions: Versions;
  lastUsedVersions: Versions | null;
  changelogs: Versions;

  activeRepo: string;

  constructor(
    private modalService: NgbModal,
    private changelogService: ChangelogService,
  ) {
  }

  get autoShow(): boolean {
    return this.changelogService.autoShow;
  }

  set autoShow(value: boolean) {
    this.changelogService.autoShow = value;
  }

  ngOnInit(): void {
    this.repos = this.changelogService.repos;
    this.lastUsedVersions = this.changelogService.lastUsedVersions;
    this.changelogs = new Versions();

    this.changelogService.getCurrentVersions().subscribe(currentVersions => {
      this.currentVersions = currentVersions;
      if (!this.lastUsedVersions) {
        this.showAll();
        this.changelogService.lastUsedVersions = this.currentVersions;
        return;
      }

      const newVersions = this.changelogService.getVersionDiff(this.lastUsedVersions, currentVersions);
      const newRepos = Object.keys(newVersions) as (keyof Versions)[];
      if (newRepos.length === 0) {
        this.showAll();
      } else {
        this.showNewVersions(newRepos);
        this.changelogService.lastUsedVersions = this.currentVersions;
      }
    });

  }

  private showAll() {
    this.activeRepo = this.repos[0];
    for (const repo of this.repos) {
      this.changelogs[repo] = 'Loading...';
      this.changelogService.getChangelog(repo).subscribe(changelog => {
        this.changelogs[repo] = changelog;
      });
    }
  }

  private showNewVersions(newRepos: (keyof Versions)[]) {
    this.activeRepo = newRepos[0];
    for (const repo of newRepos) {
      this.changelogs[repo] = 'Loading...';
      this.changelogService.getChangelog(repo, this.lastUsedVersions![repo], this.currentVersions[repo]).subscribe(changelog => {
        this.changelogs[repo] = changelog;
      });
    }
  }
}
