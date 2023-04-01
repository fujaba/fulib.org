import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private properties = new Map<string, string | null>();

  constructor() {
  }

  getAllKeys(prefix: RegExp): RegExpExecArray[] {
    if (!globalThis.localStorage) {
      return [];
    }
    const result: RegExpExecArray[] = [];
    for (let i = 0; i < globalThis.localStorage.length; i++) {
      const key = globalThis.localStorage.key(i);
      if (!key) {
        continue;
      }
      const match = prefix.exec(key);
      if (match) {
        result.push(match);
      }
    }
    return result;
  }

  get(key: string): string | null {
    let value: string | null | undefined = this.properties.get(key);
    if (value === undefined) {
      value = globalThis.localStorage?.getItem(key);
      this.properties.set(key, value);
    }
    return value;
  }

  get$(key: string): Observable<string | null> {
    return new Observable<string | null>(subscriber => {
      subscriber.next(this.get(key));
      const listener = (event: StorageEvent) => {
        if (event.key === key) {
          subscriber.next(event.newValue);
        }
      };
      globalThis?.addEventListener?.('storage', listener);
      return () => globalThis?.removeEventListener?.('storage', listener);
    });
  }

  set(key: string, value: string | null) {
    this.properties.set(key, value);
    if (value !== null) {
      globalThis.localStorage?.setItem(key, value);
    } else {
      globalThis.localStorage?.removeItem(key);
    }
  }
}
