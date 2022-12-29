import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {StorageService} from './storage.service';

export type Privacy = 'all' | 'local' | 'none' | 'nobanner';

@Injectable({
  providedIn: 'root',
})
export class PrivacyService {
  constructor(
    private storageService: StorageService,
  ) {
  }

  get privacy(): Privacy | null {
    return this.storageService.get('privacy') as Privacy;
  }

  set privacy(value: Privacy | null) {
    this.storageService.set('privacy', value === 'none' ? null : value);
  }

  get allowLocalStorage(): boolean {
    const privacy = this.privacy;
    return privacy !== null && privacy !== 'none' && privacy !== 'nobanner';
  }

  getStorage(key: string): string | null {
    return this.allowLocalStorage ? this.storageService.get(key) : null;
  }

  getStorage$(key: string): Observable<string | null> {
    return this.allowLocalStorage ? this.storageService.get$(key) : of(null);
  }

  setStorage(key: string, value: string | null): void {
    if (!this.allowLocalStorage) {
      return;
    }

    this.storageService.set(key, value);
  }
}
