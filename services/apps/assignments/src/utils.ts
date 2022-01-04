import {EventPayload} from '@app/event/event.interface';
import {MessageEvent} from '@nestjs/common';
import {isUUID} from 'class-validator';
import {randomBytes} from 'crypto';
import {FilterQuery} from 'mongoose';
import {filter, interval, map, mapTo, merge, Observable} from 'rxjs';

export function generateToken(): string {
  const bytes = randomBytes(8);
  const hex = bytes.toString('hex');
  return new Array(4).fill(0).map((_, index) => hex.substr(index * 4, 4)).join('-');
}

export function idFilter(id: string): FilterQuery<any> {
  return isUUID(id) ? {id} : {_id: id};
}

export function eventStream<T>(source: Observable<EventPayload<T>>, name: string, fltr: (data: T) => boolean): Observable<MessageEvent> {
  return merge(
    source.pipe(
      filter(({data}) => fltr(data)),
      map(({event, data}) => ({data: {event, [name]: data}})),
    ),
    interval(15000).pipe(mapTo({data: ''})),
  );
}
