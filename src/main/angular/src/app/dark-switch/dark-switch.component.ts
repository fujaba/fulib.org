import {Component, OnInit} from '@angular/core';

declare function setTheme(theme: string);

declare function getTheme(): string;

declare const themeChangeHandlers: (() => void)[];

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
    this._enabled = getTheme() === 'dark';
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
    setTheme(value ? 'dark' : 'light');
  }
}
