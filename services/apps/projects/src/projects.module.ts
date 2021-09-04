import {AuthModule} from '@app/keycloak-auth';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {environment} from '../../assignments/src/environment';
import {ProjectModule} from './project/project.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    ProjectModule,
  ],
  controllers: [],
  providers: [],
})
export class ProjectsModule {
}
