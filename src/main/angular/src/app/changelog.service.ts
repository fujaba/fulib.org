import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EMPTY, Observable} from 'rxjs';
import {flatMap} from 'rxjs/operators';
import {MarkdownService} from './markdown.service';

import {PrivacyService} from './privacy.service';
import {environment} from '../environments/environment';

export class Versions {
  'fulib.org'?: string;
  fulib?: string;
  fulibTools?: string;
  fulibYaml?: string;
  fulibTables?: string;
  fulibScenarios?: string;
  fulibMockups?: string;
  fulibGradle?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChangelogService {
  constructor(
    private privacyService: PrivacyService,
    private http: HttpClient,
    private markdownService: MarkdownService,
  ) {
  }

  public get autoShow(): boolean {
    const storage = this.privacyService.getStorage('autoShowChangelog');
    return storage !== 'false';
  }

  public set autoShow(value: boolean) {
    this.privacyService.setStorage('autoShowChangelog', `${value}`);
  }

  public get repos(): (keyof Versions)[] {
    return [
      'fulib.org',
      'fulib',
      'fulibTools',
      'fulibYaml',
      'fulibTables',
      'fulibScenarios',
      'fulibMockups',
      'fulibGradle',
    ];
  }

  getCurrentVersions(): Observable<Versions> {
    return this.http.get<Versions>(environment.apiURL + '/versions');
  }

  public get lastUsedVersions(): Versions | null {
    const stored = this.privacyService.getStorage('lastUsedVersions');
    return stored ? {...JSON.parse(stored)} as Versions : null;
  }

  public set lastUsedVersions(value: Versions | null) {
    if (value) {
      this.privacyService.setStorage('lastUsedVersions', JSON.stringify(value));
    } else {
      localStorage.removeItem('lastUsedVersions');
    }
  }

  getVersionDiff(lastUsedVersions: Versions, currentVersions: Versions) {
    const result: Versions = {};
    for (const repo of this.repos) {
      const lastUsedVersion = lastUsedVersions[repo];
      const currentVersion = currentVersions[repo];
      if (lastUsedVersion && currentVersion && currentVersion !== lastUsedVersion) {
        result[repo] = currentVersion;
      }
    }

    return result;
  }

  private loadRawChangelog(repo: string): Observable<string> {
    return this.http.get(`https://raw.githubusercontent.com/${repo}/master/CHANGELOG.md`, {responseType: 'text'});
  }

  private partialChangelog(fullChangelog: string, lastUsedVersion: string, currentVersion?: string): string {
    let result = '';
    let version = '';

    loop: for (const line of fullChangelog.split('\n')) {
      if (line.startsWith('# ')) { // indicating a version headline
        if (line.includes(lastUsedVersion)) {
          version = 'lastUsed';
        } else if (currentVersion && line.includes(currentVersion)) {
          version = 'current';
        } else { // some other version
          switch (version) {
            case 'lastUsed': // the ones after lastUsed are new and therefore interesting
              version = 'new';
              break;
            case 'current': // the ones after current are too new, and their features are not available, so they are not interesting
              version = 'future';
              break loop;
          }
        }
      }

      switch (version) {
        case 'new':
        case 'current':
          result += line + '\n';
          break;
      }
    }

    return result;
  }

  private replaceIssueLinks(repo: string, markdown: string): string {
    return markdown.replace(/#(\d+)/g, (match, issueID) => {
      return `[${match}](https://github.com/${repo}/issues/${issueID})`;
    });
  }

  getChangelog(repo: keyof Versions, lastUsedVersion?: string, currentVersion?: string): Observable<string> {
    return this.loadRawChangelog('fujaba/' + repo).pipe(
      flatMap(fullChangelog => {
        const changelog = lastUsedVersion ? this.partialChangelog(fullChangelog, lastUsedVersion, currentVersion) : fullChangelog;
        if (!changelog) { // already newest version
          return EMPTY;
        }
        const issueLinks = this.replaceIssueLinks('fujaba/' + repo, changelog);
        return this.markdownService.renderMarkdown(issueLinks);
      }),
    );
  }
}
