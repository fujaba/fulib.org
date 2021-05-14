import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private properties = new Map<string, string | null>();

  constructor() {
  }

  getAllKeys(prefix: RegExp): string[] {
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) {
        continue;
      }
      const match = prefix.exec(key);
      if (match) {
        result.push(match[1]);
      }
    }
    console.log(result);
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

  set(key: string, value: string | null) {
    this.properties.set(key, value);
    if (value !== null) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}
