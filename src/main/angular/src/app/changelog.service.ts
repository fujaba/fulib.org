import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, EMPTY} from 'rxjs';
import {flatMap} from 'rxjs/operators';

import {PrivacyService} from './privacy.service';
import {environment} from '../environments/environment';

export class Versions {
  'fulib.org': string;
  fulib: string;
  fulibTools: string;
  fulibScenarios: string;
  fulibMockups: string;
  fulibGradle: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {
  constructor(
    private privacyService: PrivacyService,
    private http: HttpClient,
  ) {
  }

  public get currentVersions(): Versions {
    return {
      ...environment.versions,
    };
  };

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

  private loadRawChangelog(repo: string): Observable<string> {
    return this.http.get(`https://raw.githubusercontent.com/${repo}/master/CHANGELOG.md`, {responseType: 'text'});
  }

  private renderMarkdown(md: string): Observable<string> {
    return this.http.post(`${environment.apiURL}/rendermarkdown`, md, {responseType: 'text'});
  }

  private partialChangelog(fullChangelog: string, lastUsedVersion: string): string {
    const pattern = `#.*${lastUsedVersion.replace(/\./g, '\\.')}\n`;
    const versionIndex = fullChangelog.search(pattern);
    if (versionIndex < 0) { // unknown version
      return '';
    }

    const nextLineIndex = fullChangelog.indexOf('\n', versionIndex); // must be > 0 because pattern ends with a line break
    const nextVersionIndex = fullChangelog.indexOf('\n# ', nextLineIndex) + 1;
    if (nextVersionIndex <= 0) { // i.e., indexOf returned < 0
      return '';
    }
    return fullChangelog.substring(nextVersionIndex);
  }

  private replaceIssueLinks(repo: string, markdown: string): string {
    return markdown.replace(/#(\d+)/g, (match, issueID) => {
      return `[${match}](https://github.com/${repo}/issues/${issueID})`;
    })
  }

  getChangelog(repo: keyof Versions, lastUsedVersion: string): Observable<string> {
    return this.loadRawChangelog('fujaba/' + repo).pipe(
      flatMap(rawChangelog => {
        const partialChangelog = this.partialChangelog(rawChangelog, lastUsedVersion);
        if (!partialChangelog) { // already newest version
          return EMPTY;
        }
        const issueLinks = this.replaceIssueLinks('fujaba/' + repo, partialChangelog);
        return this.renderMarkdown(issueLinks);
      })
    );
  }
}
