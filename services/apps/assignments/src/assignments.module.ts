import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {environment} from './environment';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
  ],
  controllers: [],
  providers: [],
})
export class AssignmentsModule {
}
