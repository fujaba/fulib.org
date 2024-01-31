import {Module} from '@nestjs/common';
import {AssignmentModule} from '../assignment/assignment.module';
import {CommentModule} from '../comment/comment.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {SolutionModule} from '../solution/solution.module';
import {StatisticsController} from './statistics.controller';
import {StatisticsService} from './statistics.service';
import {AssigneeModule} from '../assignee/assignee.module';

@Module({
  imports: [
    AssignmentModule,
    EvaluationModule,
    SolutionModule,
    CommentModule,
    AssigneeModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {
}
