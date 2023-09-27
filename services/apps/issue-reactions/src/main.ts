import { NestFactory } from '@nestjs/core';
import { IssueReactionsModule } from './issue-reactions.module';
import {environment} from "./environment";

async function bootstrap() {
  const app = await NestFactory.create(IssueReactionsModule);
  await app.listen(environment.port);
}
bootstrap();
