import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private properties = new Map<string, string | null>();

  getAllKeys(prefix: RegExp): RegExpExecArray[] {
    const result: RegExpExecArray[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
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
      value = localStorage.getItem(key);
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
      window.addEventListener('storage', listener);
      return () => window.removeEventListener('storage', listener);
    });
  }

  set(key: string, value: string | null) {
    this.properties.set(key, value);
    if (value !== null) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}
