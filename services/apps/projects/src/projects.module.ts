import {AuthModule} from '@app/keycloak-auth';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ContainerModule} from './container/container.module';
import {environment} from './environment';
import {MemberModule} from './member/member.module';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    ProjectModule,
    MemberModule,
    ContainerModule,
  ],
  controllers: [],
  providers: [],
})
export class ProjectsModule {
}