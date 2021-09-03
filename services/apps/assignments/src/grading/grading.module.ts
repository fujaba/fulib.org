import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SolutionModule} from '../solution/solution.module';
import {GradingController} from './grading.controller';
import {GradingSchema} from './grading.schema';
import {GradingService} from './grading.service';

// TODO migration: gradings { id -> _id, solutionID -> solution, taskID -> task, userId -> creator, timeStamp -> timestamp }

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'gradings',
        schema: GradingSchema,
      },
    ]),
    AssignmentModule,
    SolutionModule,
  ],
  controllers: [GradingController],
  providers: [GradingService],
})
export class GradingModule {
}
