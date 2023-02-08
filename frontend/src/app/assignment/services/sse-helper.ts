import {Observable} from 'rxjs';

export function observeSSE<T, K extends string>(url: string): Observable<{ event: string } & Record<K, T>> {
  return new Observable(observer => {
    const eventSource = new EventSource(url);
    eventSource.addEventListener('message', ({data}) => observer.next(JSON.parse(data)));
    eventSource.addEventListener('error', (error) => observer.error(error));
    return () => eventSource.close();
  });
}
