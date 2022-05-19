import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {Transport} from '@nestjs/microservices';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AssignmentsModule} from './assignments.module';
import {environment} from './environment';

async function bootstrap() {
  const app = await NestFactory.create(AssignmentsModule);
  const prefix = `/api/${environment.version}`;
  app.enableCors();
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.connectMicroservice({
    transport: Transport.NATS,
    options: environment.nats,
  });

  const config = new DocumentBuilder()
    .setTitle('Assignments')
    .setDescription('The assignments API description')
    .setVersion(environment.version)
    .addBearerAuth()
    .addServer('http://localhost:' + environment.port, 'Local')
    .addServer('https://{subdomain}.fulib.org', 'Production', {
      subdomain: {
        description: 'www - Production (stable; master branch), dev - Development (beta; develop branch)',
        enum: ['www', 'dev'],
        default: 'www',
      },
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(prefix, app, document);

  await app.startAllMicroservices();
  await app.listen(environment.port);
}

bootstrap();
