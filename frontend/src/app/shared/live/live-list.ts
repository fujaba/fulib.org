import {Observable} from 'rxjs';
import {mapTo, switchMap, tap} from 'rxjs/operators';
import {EventSource} from './event-source';
import {Repository} from './repository';

export class LiveList<T, PARENTID, ID = string> {
  items: T[] = [];

  constructor(
    private repo: Repository<T, PARENTID, ID>,
    private parent: PARENTID,
    private eventSource: EventSource,
    private idExtractor: (item: T) => ID,
  ) {
  }

  load(): Observable<T[]> {
    return this.repo.findAll(this.parent).pipe(
      tap(items => this.items = items),
      switchMap(() => this.eventSource.listen<T>()),
      tap(event => {
        this.safeApply(this.idExtractor(event.data), event.event.endsWith('deleted') ? null : event.data);
      }),
      mapTo(this.items),
    );
  }

  safeApply(id: ID, item: T | null) {
    const index = this.items.findIndex(c => id === this.idExtractor(c));
    if (index >= 0) {
      if (item) {
        this.items[index] = item;
      } else {
        this.items.splice(index, 1);
      }
    } else if (item) {
      this.items.push(item);
    }
  }
}
