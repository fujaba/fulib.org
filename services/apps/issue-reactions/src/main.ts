import { NestFactory } from '@nestjs/core';
import { IssueReactionsModule } from './issue-reactions.module';

async function bootstrap() {
  const app = await NestFactory.create(IssueReactionsModule);
  await app.listen(3000);
}
bootstrap();
