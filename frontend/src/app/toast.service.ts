import {Injectable} from '@angular/core';

export interface Toast {
  title?: string;
  body?: string;
  class?: string | Record<string, boolean> | string[];
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  constructor() {
  }

  add(toast: Toast) {
    this.toasts.push(toast);
  }

  success(title: string, body: string) {
    this.add({
      title,
      body,
      class: 'bg-success text-light',
    });
  }

  warn(title: string, body: string) {
    this.add({
      title,
      body,
      class: 'bg-warning text-dark',
    });
  }

  error(title: string, body: string, error?: any) {
    console.error(error);
    if (error) {
      body += ': ' + error.error?.message ?? error.message ?? error;
    }
    this.add({
      title,
      body,
      class: 'bg-danger text-light',
    });
  }

  remove(toast: Toast) {
    this.toasts.removeFirst(t => t === toast);
  }
}
