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
import {SearchModule} from './search/search.module';
import {SelectionModule} from './selection/selection.module';
import {SolutionModule} from './solution/solution.module';
import {StatisticsModule} from './statistics/statistics.module';
import {SentryInterceptor, SentryModule} from "@ntegral/nestjs-sentry";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {EmbeddingModule} from './embedding/embedding.module';
import {MossModule} from './moss/moss.module';
import { FileModule } from './file/file.module';
import {AssignmentMemberModule} from "./assignment-member/assignment-member.module";
import {CourseMemberModule} from "./course-member/course-member.module";

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    EventModule.forRoot({nats: environment.nats}),
    ScheduleModule.forRoot(),
    SentryModule.forRoot({
      enabled: environment.nodeEnv !== 'development',
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
    AssignmentMemberModule,
    ClassroomModule,
    SolutionModule,
    AssigneeModule,
    CommentModule,
    CourseModule,
    CourseMemberModule,
    EvaluationModule,
    SearchModule,
    StatisticsModule,
    SelectionModule,
    MossModule,
    EmbeddingModule,
    FileModule,
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
