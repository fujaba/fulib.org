import {Injectable} from '@angular/core';
import {PrivacyService} from './privacy.service';

export class Versions {
  webapp: string;
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
  ) {
  }

  public get currentVersion(): Versions {
    return {
      webapp: '$$version$$',
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
}
