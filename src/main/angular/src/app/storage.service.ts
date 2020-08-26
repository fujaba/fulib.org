import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private properties = new Map<string, string | null>();

  constructor() {
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
