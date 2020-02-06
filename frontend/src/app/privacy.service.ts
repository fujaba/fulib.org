import { Injectable } from '@angular/core';

export type Privacy = 'all' | 'local' | 'none' | 'nobanner';

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

  get allowLocalStorage(): boolean {
    const privacy = this.privacy;
    return privacy && privacy !== 'none';
  }

  getStorage(key: string): string | null {
    return this.allowLocalStorage ? localStorage.getItem(key) : null;
  }

  setStorage(key: string, value: string) {
    if (this.allowLocalStorage) {
      localStorage.setItem(key, value);
    }
  }
}
