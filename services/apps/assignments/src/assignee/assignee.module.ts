import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {AssigneeController} from './assignee.controller';
import {AssigneeSchema} from './assignee.schema';
import {AssigneeService} from './assignee.service';

// TODO migration: assignee -> assignees { _id -> -, id -> solution, assignee }

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'assignees',
        schema: AssigneeSchema,
      },
    ]),
    AssignmentModule,
  ],
  controllers: [AssigneeController],
  providers: [AssigneeService],
})
export class AssigneeModule {
}
