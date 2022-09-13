import {Injectable} from '@angular/core';
import {PrivacyService} from '../../services/privacy.service';

export type ConfigKey =
  | 'name'
  | 'email'
  | 'ide'
  | 'cloneProtocol'
  ;

export interface ConfigOption {
  key: ConfigKey;
  title: string;
  description: string;
  options?: [string, string][];
  default?: string;
}

export const CONFIG_OPTIONS: ConfigOption[] = [
  {
    key: 'name',
    title: 'Name',
    description: 'Your full name for use in assignments, solutions, comments and evaluations.',
  },
  {
    key: 'email',
    title: 'E-Mail Address',
    description: 'Your email address for use in assignments, solutions, comments and evaluations.',
  },
  {
    key: 'ide',
    title: 'IDE',
    description: 'Your preferred IDE for cloning repositories.',
    options: [['vscode', 'VSCode'], ['code-oss', 'Code - OSS'], ['vscodium', 'VSCodium']],
    default: 'vscode',
  },
  {
    key: 'cloneProtocol',
    title: 'Git Clone Protocol',
    description: 'The protocol to use when cloning a repository.',
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

  getAll(): Record<ConfigKey, string> {
    const options = {} as Record<ConfigKey, string>;
    for (const option of CONFIG_OPTIONS) {
      options[option.key] = this.get(option.key);
    }
    return options;
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
