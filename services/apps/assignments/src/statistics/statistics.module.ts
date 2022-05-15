import {Module} from '@nestjs/common';
import {AssignmentModule} from '../assignment/assignment.module';
import {CommentModule} from '../comment/comment.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {SolutionModule} from '../solution/solution.module';
import {TelemetryModule} from '../telemetry/telemetry.module';
import {StatisticsController} from './statistics.controller';
import {StatisticsService} from './statistics.service';

@Module({
  imports: [
    AssignmentModule,
    EvaluationModule,
    SolutionModule,
    CommentModule,
    TelemetryModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {
}
