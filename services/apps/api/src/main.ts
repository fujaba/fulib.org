import {Logger} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {SwaggerModule} from '@nestjs/swagger';
import {ApiModule} from "./api.module";
import {environment} from "./environment";
import {isErrorResult, merge} from "openapi-merge";
import {SingleMergeInput} from "openapi-merge/dist/data";

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const prefix = `/api/${environment.version}`;
  app.enableCors();
  app.setGlobalPrefix(prefix);

  const inputs = await Promise.all(environment.servers.map(async ([name, url]): Promise<SingleMergeInput> => {
    const res = await fetch(`${url}/api/${environment.version}-json`);
    return {
      description: {
        append: true,
        title: {
          value: name,
        },
      },
      oas: await res.json(),
    };
  }));
  const merged = merge(inputs);
  if (!isErrorResult(merged)) {
    merged.output.info.title = 'fulib.org APIs';
    merged.output.servers = environment.servers.map(([name, url]) => ({
      url,
      description: name,
    }));
    SwaggerModule.setup(prefix, app, merged.output as any);
  }

  await app.listen(environment.port);
  new Logger().log(`🚀 API Service running at http://localhost:${environment.port}${prefix}`);
}

bootstrap();
