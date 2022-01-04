import {EventPayload} from '@app/event/event.interface';
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

  emit<T>(pattern: string, message: EventPayload<T>) {
    const {event, data, users} = message;
    this.eventEmitter2.emit(pattern, event, data, users);
    this.client.emit(pattern, message).subscribe();
  }
}
