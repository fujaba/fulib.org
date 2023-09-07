import {EventModule} from '@app/event/event.module';
import {AuthModule} from '@app/keycloak-auth';
import {HttpException, Module} from '@nestjs/common';
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
import {SentryInterceptor, SentryModule} from "@ntegral/nestjs-sentry";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {EmbeddingModule} from './embedding/embedding.module';
import {MossModule} from './moss/moss.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    EventModule.forRoot({nats: environment.nats}),
    ScheduleModule.forRoot(),
    SentryModule.forRoot({
      dsn: environment.sentryDsn,
      environment: environment.nodeEnv,
      release: environment.version,
      initialScope: {
        tags: {
          service: 'assignments',
        },
      },
    }),
    AssignmentModule,
    ClassroomModule,
    SolutionModule,
    AssigneeModule,
    GradingModule,
    CommentModule,
    CourseModule,
    EvaluationModule,
    SearchModule,
    StatisticsModule,
    SelectionModule,
    TelemetryModule,
    MossModule,
    EmbeddingModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new SentryInterceptor({
        filters: [{
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus(),
        }],
      }),
    }
  ],
})
export class AssignmentsModule {
}
