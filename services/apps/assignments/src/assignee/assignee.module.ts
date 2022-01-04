import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {AssigneeController} from './assignee.controller';
import {AssigneeSchema} from './assignee.schema';
import {AssigneeService} from './assignee.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'assignee',
        schema: AssigneeSchema,
      },
    ]),
    AssignmentModule,
  ],
  controllers: [AssigneeController],
  providers: [AssigneeService],
  exports: [
    AssigneeService,
  ],
})
export class AssigneeModule {
}
