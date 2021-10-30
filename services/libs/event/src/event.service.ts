import {Inject, Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';
import {ClientProxy} from '@nestjs/microservices';

@Injectable()
export class EventService {
  constructor(
    @Inject('EVENT_SERVICE') private client: ClientProxy,
    private eventEmitter2: EventEmitter2,
  ) {
  }

  emit<T>(event: string, data: T, users?: string[]) {
    this.eventEmitter2.emit(event, data, users);
    this.client.emit(event, {data, users}).subscribe();
  }
}
