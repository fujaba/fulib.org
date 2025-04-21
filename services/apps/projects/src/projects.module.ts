import {EventModule} from '@app/event/event.module';
import {AuthModule} from '@app/keycloak-auth';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ScheduleModule} from '@nestjs/schedule';
import {SentryModule} from '@sentry/nestjs/setup';

import {ContainerModule} from './container/container.module';
import {environment} from './environment';
import {MemberModule} from './member/member.module';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    EventModule.forRoot({nats: environment.nats}),
    ScheduleModule.forRoot(),
    SentryModule.forRoot(),
    ProjectModule,
    MemberModule,
    ContainerModule,
  ],
})
export class ProjectsModule {
}
