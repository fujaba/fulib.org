import {EventModule} from '@clashsoft/nestx';
import {AuthModule} from '@app/keycloak-auth';
import {Module} from '@nestjs/common';
import {Transport} from '@nestjs/microservices';
import {MongooseModule} from '@nestjs/mongoose';
import {ScheduleModule} from '@nestjs/schedule';
import {AssigneeModule} from './assignee/assignee.module';
import {AssignmentModule} from './assignment/assignment.module';
import {ClassroomModule} from './classroom/classroom.module';
import {CommentModule} from './comment/comment.module';
import {CourseModule} from './course/course.module';
import {environment} from './environment';
import {EvaluationModule} from './evaluation/evaluation.module';
import {GradingModule} from './grading/grading.module';
import {SearchModule} from './search/search.module';
import {SelectionModule} from './selection/selection.module';
import {SolutionModule} from './solution/solution.module';
import {StatisticsModule} from './statistics/statistics.module';
import {TelemetryModule} from './telemetry/telemetry.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    EventModule.forRoot({
      transport: Transport.NATS,
      transportOptions: environment.nats,
      userIdProvider: async () => undefined,
    }),
    ScheduleModule.forRoot(),
    AssignmentModule,
    SolutionModule,
    AssigneeModule,
    GradingModule,
    CommentModule,
    CourseModule,
    EvaluationModule,
    ClassroomModule,
    SearchModule,
    StatisticsModule,
    SelectionModule,
    TelemetryModule,
  ],
  controllers: [],
  providers: [],
})
export class AssignmentsModule {
}
