import {DynamicModule, Global} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {EventService} from './event.service';

@Global()
export class EventModule {
  static forRoot(options: { nats: any }): DynamicModule {
    return {
      module: EventModule,
      imports: [
        ClientsModule.register([
          {
            name: 'EVENT_SERVICE',
            transport: Transport.NATS,
            options: options.nats,
          },
        ]),
        EventEmitterModule.forRoot({
          wildcard: true,
        }),
      ],
      providers: [
        EventService,
      ],
      exports: [
        EventEmitterModule,
        EventService,
      ],
    };
  }
}
