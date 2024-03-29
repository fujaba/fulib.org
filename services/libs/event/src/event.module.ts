import {EventService} from '@mean-stream/nestx';
import {DynamicModule, Global} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {ClientsModule, NatsOptions, Transport} from '@nestjs/microservices';

@Global()
export class EventModule {
  static forRoot(options: { nats: NatsOptions['options'] }): DynamicModule {
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
