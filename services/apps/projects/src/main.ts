import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {environment} from './environment';
import {ProjectsModule} from './projects.module';

async function bootstrap() {
  const app = await NestFactory.create(ProjectsModule);
  const prefix = `/api/${environment.version}`;
  app.enableCors();
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Projects')
    .setVersion(environment.version)
    .addBearerAuth()
    .addServer(`http://localhost:${environment.port}`, 'Local')
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

  await app.listen(environment.port);
}

bootstrap();
