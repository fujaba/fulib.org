import {Observable} from 'rxjs';
import {mapTo, switchMap, tap} from 'rxjs/operators';
import {EventSource} from './event-source';
import {Repository, Resource} from './repository';

export class LiveList<R extends Resource> {
  items: R['type'][] = [];

  constructor(
    private repo: Repository<R>,
    private parent: R['parent'],
    private eventSource: EventSource<R['event']>,
    private idExtractor: (item: R['type']) => R['id'],
    private eventExtractor: (event: R['event']) => {desc: string, data: R['type']},
  ) {
  }

  load(): Observable<R['type'][]> {
    return this.repo.findAll(this.parent).pipe(
      tap(items => this.items = items),
      switchMap(() => this.eventSource.listen<R['type']>()),
      tap(event => {
        const {desc, data} = this.eventExtractor(event);
        this.safeApply(this.idExtractor(data), desc.endsWith('deleted') ? null : data);
      }),
      mapTo(this.items),
    );
  }

  safeApply(id: R['id'], item: R['type'] | null) {
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
