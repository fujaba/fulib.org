import { Injectable } from '@angular/core';

type Privacy = 'all' | 'local' | 'none' | 'nobanner';

@Injectable({
  providedIn: 'root'
})
export class PrivacyService {
  private _privacy: Privacy | null;

  constructor() { }

  get privacy(): Privacy | null {
    return this._privacy || localStorage.getItem('privacy') as Privacy;
  }

  set privacy(value: Privacy | null) {
    if (this._privacy !== value) {
      this._privacy = value;
      localStorage.setItem('privacy', value);
    }
  }
}
