import {Injectable} from '@angular/core';
import {PrivacyService} from '../../privacy.service';

export type ConfigKey =
  | 'ide'
  | 'cloneProtocol'
  ;

export interface ConfigOption {
  key: ConfigKey;
  title: string;
  options: [string, string][];
  default: string;
}

export const CONFIG_OPTIONS: ConfigOption[] = [
  {
    key: 'ide',
    title: 'IDE',
    options: [['vscode', 'VSCode'], ['code-oss', 'Code - OSS'], ['vscodium', 'VSCodium']],
    default: 'vscode',
  },
  {
    key: 'cloneProtocol',
    title: 'Git Clone Protocol',
    options: [['https', 'HTTPS'], ['ssh', 'SSH']],
    default: 'https',
  },
];

@Injectable()
export class ConfigService {
  constructor(
    private privacyService: PrivacyService,
  ) {
  }

  get(key: ConfigKey): string {
    const option = CONFIG_OPTIONS.find(o => o.key === key);
    return this.privacyService.getStorage('assignments/' + key) || option?.default || '';
  }

  set(key: ConfigKey, value: string) {
    if (this.getOption(key)) {
      this.privacyService.setStorage('assignments/' + key, value);
    }
  }

  private getOption(key: ConfigKey): ConfigOption | undefined {
    return CONFIG_OPTIONS.find(o => o.key === key);
  }
}
