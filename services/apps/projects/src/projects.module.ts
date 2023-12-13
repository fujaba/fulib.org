import {AuthModule} from '@app/keycloak-auth';
import {HttpException, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ContainerModule} from './container/container.module';
import {environment} from './environment';
import {MemberModule} from './member/member.module';
import {ProjectModule} from './project/project.module';
import {ScheduleModule} from "@nestjs/schedule";
import {SentryInterceptor, SentryModule} from "@ntegral/nestjs-sentry";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {EventModule} from "@app/event/event.module";

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    EventModule.forRoot({nats: environment.nats}),
    ProjectModule,
    MemberModule,
    ContainerModule,
    ScheduleModule.forRoot(),
    SentryModule.forRoot({
      dsn: environment.sentryDsn,
      environment: environment.nodeEnv,
      release: environment.version,
      initialScope: {
        tags: {
          service: 'projects',
        },
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new SentryInterceptor({
        filters: [{
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus(),
        }],
      }),
    }
  ],
})
export class ProjectsModule {
}
