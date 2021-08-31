import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AssignmentsModule} from './assignments.module';
import {environment} from './environment';

async function bootstrap() {
  const app = await NestFactory.create(AssignmentsModule);
  const prefix = `/api/${environment.version}`;
  app.setGlobalPrefix(prefix);

  const config = new DocumentBuilder()
    .setTitle('Assignments')
    .setDescription('The assignments API description')
    .setVersion(environment.version)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(prefix, app, document);

  await app.listen(environment.port);
}

bootstrap();
