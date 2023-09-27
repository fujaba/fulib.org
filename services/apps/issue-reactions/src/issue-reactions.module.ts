import {HttpException, Module} from '@nestjs/common';
import {IssueReactionsService} from './issue-reactions.service';
import {MongooseModule} from "@nestjs/mongoose";
import {environment} from "../../assignments/src/environment";
import {SentryInterceptor, SentryModule} from "@ntegral/nestjs-sentry";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {IssueModule} from "./issue/issue.module";

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
    IssueModule,
  ],
  controllers: [],
  providers: [
    IssueReactionsService,
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
