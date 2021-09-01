import {AuthModule} from '@app/keycloak-auth';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {environment} from './environment';
import { AssignmentModule } from './assignment/assignment.module';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    AssignmentModule,
    CourseModule,
  ],
  controllers: [],
  providers: [],
})
export class AssignmentsModule {
}