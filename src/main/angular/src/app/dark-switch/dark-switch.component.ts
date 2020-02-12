import {Component, OnInit} from '@angular/core';

declare function setTheme(theme: string);

declare function getTheme(): string;

@Component({
  selector: 'app-dark-switch',
  templateUrl: './dark-switch.component.html',
  styleUrls: ['./dark-switch.component.scss']
})
export class DarkSwitchComponent implements OnInit {
  private _enabled: boolean;

  constructor() {
  }

  ngOnInit() {
    this.loadEnabled();
  }

  private loadEnabled(): void {
    // TODO try-catch not needed once darkmode is an npm package
    try {
      this._enabled = getTheme() === 'dark';
    } catch {
    }
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    // TODO try-catch not needed once darkmode is an npm package
    try {
      this._enabled = value;
      setTheme(value ? 'dark' : 'light');
    } catch {
    }
  }
}
