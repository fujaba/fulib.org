import {HttpException, Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {SentryInterceptor, SentryModule} from "@ntegral/nestjs-sentry";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {IssueModule} from "./issue/issue.module";
import {IssueFinderModule} from './issue-finder/issue-finder.module';
import {ScheduleModule} from "@nestjs/schedule";
import {CommentPosterModule} from './comment-poster/comment-poster.module';
import {ReactionHandlerModule} from './reaction-handler/reaction-handler.module';
import {EventModule} from "@app/event/event.module";
import {environment} from "./environment";

@Module({
  imports: [
    MongooseModule.forRoot(environment.mongo.uri, environment.mongo.options),
    SentryModule.forRoot({
      dsn: environment.sentryDsn,
      environment: environment.nodeEnv,
      release: environment.version,
      initialScope: {
        tags: {
          service: 'issue-reactions',
        },
      },
    }),
    EventModule.forRoot({nats: environment.nats}),
    ScheduleModule.forRoot(),
    IssueModule,
    IssueFinderModule,
    CommentPosterModule,
    ReactionHandlerModule,
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
    },
  ],
})
export class IssueReactionsModule {
}
