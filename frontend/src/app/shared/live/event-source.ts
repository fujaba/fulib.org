import {identity, Observable} from 'rxjs';

export interface EventSource<E> {
  listen(): Observable<E>;
}

export class ServerSentEventSource<E> implements EventSource<E> {
  constructor(
    private url: string,
    private parser: (message: string) => any = JSON.parse,
    private extractor: (obj: any) => E = identity,
    private selector: (event: E) => boolean = () => true,
  ) {
  }

  listen(): Observable<E> {
    return new Observable<E>(subscriber => {
      const eventSource = new EventSource(this.url);
      eventSource.onmessage = message => {
        const obj = this.parser(message.data);
        const event = this.extractor(obj);
        if (this.selector(event)) {
          subscriber.next(event);
        }
      };
      eventSource.onerror = err => subscriber.error(err);
      return () => eventSource.close();
    });
  }
}
