import {NestFactory} from '@nestjs/core';
import {ProjectsModule} from './projects.module';

async function bootstrap() {
  const app = await NestFactory.create(ProjectsModule);
  await app.listen(3000);
}

bootstrap();
