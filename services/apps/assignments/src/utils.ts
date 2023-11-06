import {MessageEvent} from '@nestjs/common';
import {WsResponse} from '@nestjs/websockets';
import {isUUID} from 'class-validator';
import {randomBytes} from 'crypto';
import {FilterQuery} from 'mongoose';
import {interval, map, mapTo, merge, Observable} from 'rxjs';

export function generateToken(): string {
  const bytes = randomBytes(8);
  const hex = bytes.toString('hex');
  return new Array(4).fill(0).map((_, index) => hex.substr(index * 4, 4)).join('-');
}

export function eventStream<T>(source: Observable<WsResponse<T>>, name: string): Observable<MessageEvent> {
  return merge(
    source.pipe(
      map(({event, data}) => ({data: {event: event.substring(event.lastIndexOf('.') + 1), [name]: data}})),
    ),
    interval(15000).pipe(mapTo({type: 'noop', data: 'noop'})),
  );
}
