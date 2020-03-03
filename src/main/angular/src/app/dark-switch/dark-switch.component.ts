import {Component, OnInit} from '@angular/core';

import {ThemeService} from '../theme.service';

@Component({
  selector: 'app-dark-switch',
  templateUrl: './dark-switch.component.html',
  styleUrls: ['./dark-switch.component.scss']
})
export class DarkSwitchComponent implements OnInit {
  private _enabled: boolean;

  constructor(
    private themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.loadEnabled();
  }

  private loadEnabled(): void {
    this.enabled = this.themeService.theme === 'dark';
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
    this.themeService.theme = value ? 'dark' : 'light';
  }
}
