import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, mapTo, tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {MarkdownService} from './markdown.service';

import {PrivacyService} from './privacy.service';

export const REPOS = [
  'fulib.org',
  'fulib',
  'fulibTools',
  'fulibYaml',
  'fulibTables',
  'fulibScenarios',
  'fulibGradle',
  'fulibWorkflows'
] as const;

export type Repository = (typeof REPOS)[number];

export type Versions = Record<Repository, string>;

export class Release {
  tag_name: string;
  name: string;
  body: string;
  created_at: string; // Date

  bodyHtml?: string;
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

  getCurrentVersions(): Observable<Versions> {
    return this.http.get<Versions>(environment.apiURL + '/versions');
  }

  stripBuildSuffix(versions: Versions): Versions {
    return Object.fromEntries(Object.entries(versions).map(([repo, version]) => {
      const end = version.indexOf('-');
      return [repo, end < 0 ? version : version.substring(0, end)];
    })) as Versions;
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
    const result = {} as Versions;
    for (const repo of REPOS) {
      const lastUsedVersion = lastUsedVersions[repo];
      const currentVersion = currentVersions[repo];
      if (lastUsedVersion && currentVersion && currentVersion !== lastUsedVersion) {
        result[repo] = currentVersion;
      }
    }

    return result;
  }

  private loadRawChangelog(repo: string): Observable<Release[]> {
    return this.http.get<Release[]>(`https://api.github.com/repos/fujaba/${repo}/releases`, {
      headers: {
        Accept: 'application/vnd.github.raw',
      },
    });
  }

  private partialChangelog(fullChangelog: Release[], lastUsedVersion: string, currentVersion?: string): Release[] {
    const start = fullChangelog.findIndex(r => r.tag_name === 'v' + currentVersion);
    const end = currentVersion ? fullChangelog.findIndex(r => r.tag_name === 'v' + lastUsedVersion) : fullChangelog.length;
    return fullChangelog.slice(start, end);
  }

  private replaceIssueLinks(repo: string, markdown: string): string {
    return markdown.replace(/#(\d+)/g, (match, issueID) => {
      return `[${match}](https://github.com/${repo}/issues/${issueID})`;
    });
  }

  getChangelog(repo: Repository, lastUsedVersion?: string, currentVersion?: string): Observable<Release[]> {
    return this.loadRawChangelog(repo).pipe(
      map(fullChangelog => lastUsedVersion ? this.partialChangelog(fullChangelog, lastUsedVersion, currentVersion) : fullChangelog),
    );
  }

  renderChangelog(repo: Repository, release: Release): Observable<Release> {
    const issueLinks = this.replaceIssueLinks('fujaba/' + repo, release.body);
    return this.markdownService.renderMarkdown(issueLinks).pipe(tap(html => release.bodyHtml = html), mapTo(release));
  }
}
