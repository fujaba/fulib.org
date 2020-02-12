import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private properties: Map<string, string>;

  constructor() {
  }

  get(key: string): string | null {
    let token = this.properties.get(key);
    if (typeof token == 'undefined') {
      token = localStorage.getItem(key);
      this.properties.set(key, token);
    }
    return token;
  }

  set(key: string, value: string | null) {
    this.properties.set(key, value);
    if (value) {
      localStorage.setItem(key, value);
    }
    else {
      localStorage.removeItem(key);
    }
  }
}
