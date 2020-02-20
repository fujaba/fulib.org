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
      'fulib.org': '$$version$$',
      fulib: '$$fulibVersion$$',
      fulibTools: '$$fulibToolsVersion$$',
      fulibScenarios: '$$fulibScenariosVersion$$',
      fulibMockups: '$$fulibMockupsVersion$$',
      fulibGradle: '$$fulibGradleVersion$$',
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

  private partialChangelog(fullChangelog: string, lastUsedVersion: string) {
    const versionIndex = fullChangelog.indexOf(lastUsedVersion);
    const nextVersionIndex = fullChangelog.indexOf('\n# ', versionIndex) + 1;
    return fullChangelog.substring(nextVersionIndex);
  }

  getChangelog(repo: keyof Versions, lastUsedVersion: string): Observable<string> {
    return this.loadRawChangelog('fujaba/' + repo).pipe(
      flatMap(rawChangelog => {
        const partialChangelog = this.partialChangelog(rawChangelog, lastUsedVersion);
        return this.renderMarkdown(partialChangelog);
      })
    );
  }
}
