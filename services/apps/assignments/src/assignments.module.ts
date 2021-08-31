import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {environment} from './environment';
import { AssignmentModule } from './assignment/assignment.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AssignmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AssignmentsModule {
}
