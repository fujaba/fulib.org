import {Injectable} from '@angular/core';
import {PrivacyService} from '../../services/privacy.service';
import {Config} from "../model/config";
import {transformDecoratorResources} from "@angular/compiler-cli/src/ngtsc/annotations/component/src/resources";
import {plainToClass} from "class-transformer";

export type ConfigKey = keyof Config;

@Injectable()
export class ConfigService {
  readonly default = new Config();

  constructor(
    private privacyService: PrivacyService,
  ) {
  }

  getAll(): Config {
    const options = {...this.default};
    for (const key of Object.keys(this.default)) {
      options[key] = this.get(key as ConfigKey);
    }
    return plainToClass(Config, options);
  }

  setAll(options: Config) {
    for (const key of Object.keys(options) as ConfigKey[]) {
      this.set(key, options[key].toString());
    }
  }

  get<K extends ConfigKey>(key: K): Config[K] {
    return this.privacyService.getStorage('assignments/' + key) as Config[K] || this.default[key];
  }

  getBool(key: ConfigKey): boolean {
    return this.get(key) === 'true';
  }

  set(key: ConfigKey, value: string) {
    if (key in this.default) {
      this.privacyService.setStorage('assignments/' + key, value);
    }
  }
}
