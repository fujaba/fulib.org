import {EventModule} from '@app/event/event.module';
import {AuthModule} from '@app/keycloak-auth';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ScheduleModule} from '@nestjs/schedule';
import {SentryModule} from '@sentry/nestjs/setup';

import {AssigneeModule} from './assignee/assignee.module';
import {AssignmentMemberModule} from './assignment-member/assignment-member.module';
import {AssignmentModule} from './assignment/assignment.module';
import {ClassroomModule} from './classroom/classroom.module';
import {CommentModule} from './comment/comment.module';
import {CourseMemberModule} from './course-member/course-member.module';
import {CourseModule} from './course/course.module';
import {EmbeddingModule} from './embedding/embedding.module';
import {environment} from './environment';
import {EvaluationModule} from './evaluation/evaluation.module';
import {FileModule} from './file/file.module';
import {MossModule} from './moss/moss.module';
import {SearchModule} from './search/search.module';
import {SelectionModule} from './selection/selection.module';
import {SolutionModule} from './solution/solution.module';
import {StatisticsModule} from './statistics/statistics.module';

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    AuthModule.register(environment.auth),
    EventModule.forRoot({nats: environment.nats}),
    ScheduleModule.forRoot(),
    SentryModule.forRoot(),
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
})
export class AssignmentsModule {
}
