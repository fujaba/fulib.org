import {NotFoundInterceptor} from '@app/not-found/not-found.interceptor';
import {applyDecorators, UseInterceptors} from '@nestjs/common';
import {ApiNotFoundResponse} from '@nestjs/swagger';

export function NotFound(description?: string) {
  return applyDecorators(
    UseInterceptors(NotFoundInterceptor),
    ApiNotFoundResponse({
      description: description ?? 'Not found.',
    }),
  );
}
