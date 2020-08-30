import {Injectable} from '@angular/core';

import {ThemeConfig} from 'bootstrap-darkmode';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  config = new ThemeConfig();

  constructor() {
    this.config.initTheme();
  }

  get theme(): string {
    return this.config.getTheme();
  }

  set theme(value: string) {
    this.config.setTheme(value);
  }

  addChangeHandler(handler: () => void) {
    this.config.themeChangeHandlers.push(handler);
  }

  removeHandler(handler: () => void) {
    const index = this.config.themeChangeHandlers.indexOf(handler);
    this.config.themeChangeHandlers.splice(index, 1);
  }
}
