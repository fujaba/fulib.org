import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {AssigneeController} from './assignee.controller';
import {AssigneeHandler} from './assignee.handler';
import {Assignee, AssigneeSchema} from './assignee.schema';
import {AssigneeService} from './assignee.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Assignee.name,
        schema: AssigneeSchema,
      },
    ]),
    AssignmentModule,
  ],
  controllers: [AssigneeController],
  providers: [
    AssigneeService,
    AssigneeHandler,
  ],
  exports: [
    AssigneeService,
  ],
})
export class AssigneeModule {
}
