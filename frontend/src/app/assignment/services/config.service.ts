import {Injectable} from '@angular/core';
import {PrivacyService} from '../../services/privacy.service';

export type ConfigKey =
  | 'name'
  | 'email'
  | 'ide'
  | 'cloneProtocol'
  | 'cloneRef'
  | 'codeSearch'
  | 'similarSolutions'
  | 'snippetSuggestions'
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
  {
    key: 'cloneRef',
    title: 'Git Clone Ref',
    description: 'The ref to use when cloning a repository. ' +
      'Tags are only supported in VSCode v1.74+ and Assignments imported after 2022-12-21.',
    options: [['none', 'None'], ['tag', 'Tag']],
    default: 'tag',
  },
  {
    key: 'codeSearch',
    title: 'Code Search',
    description: 'Enable Code Search globally.',
    options: [['true', '✔️ Enabled'], ['false', '❌ Disabled']],
    default: 'true',
  },
  {
    key: 'snippetSuggestions',
    title: 'Snippet Suggestions',
    description: 'Enable Snippet Suggestions globally.',
    options: [['true', '✔️ Enabled'], ['false', '❌ Disabled']],
    default: 'true',
  },
  {
    key: 'similarSolutions',
    title: 'Similar Solutions',
    description: 'Enable Similar Solutions globally.',
    options: [['true', '✔️ Enabled'], ['false', '❌ Disabled']],
    default: 'true',
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

  setAll(options: Record<ConfigKey, string>) {
    for (const key of Object.keys(options) as ConfigKey[]) {
      this.set(key, options[key]);
    }
  }

  get(key: ConfigKey): string {
    const option = CONFIG_OPTIONS.find(o => o.key === key);
    return this.privacyService.getStorage('assignments/' + key) || option?.default || '';
  }

  getBool(key: ConfigKey): boolean {
    return this.get(key) === 'true';
  }

  set(key: ConfigKey, value: string) {
    if (this.getOption(key)) {
      this.privacyService.setStorage('assignments/' + key, value);
    }
  }

  setBool(key: ConfigKey, value: boolean) {
    this.set(key, value ? 'true' : 'false');
  }

  private getOption(key: ConfigKey): ConfigOption | undefined {
    return CONFIG_OPTIONS.find(o => o.key === key);
  }
}
