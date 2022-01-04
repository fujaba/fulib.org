import {Injectable} from '@angular/core';

export interface Action {
  name: string;
  link?: any[];
  run?: () => void;
}

export interface Toast {
  title?: string;
  body?: string;
  class?: string | Record<string, boolean> | string[];
  delay?: number;
  actions?: Action[];
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  constructor() {
  }

  add(toast: Toast): Toast {
    this.toasts.push(toast);
    return toast;
  }

  success(title: string, body: string): Toast {
    return this.add({
      title,
      body,
      class: 'bg-success text-light',
    });
  }

  warn(title: string, body: string): Toast {
    return this.add({
      title,
      body,
      class: 'bg-warning text-dark',
    });
  }

  error(title: string, body: string, error?: any): Toast {
    console.error(error);
    if (error) {
      body += ': ' + error.error?.message ?? error.message ?? error;
    }
    return this.add({
      title,
      body,
      class: 'bg-danger text-light',
    });
  }

  remove(toast: Toast) {
    this.toasts.removeFirst(t => t === toast);
  }
}
