import {CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException} from '@nestjs/common';
import {Request} from 'express';
import {map, Observable} from 'rxjs';

export function notFound(message: string): never {
  throw new NotFoundException(message);
}

@Injectable()
export class NotFoundInterceptor<T> implements NestInterceptor<T | null | undefined, T> {
  intercept(context: ExecutionContext, next: CallHandler<T | null | undefined>): Observable<T> {
    return next.handle().pipe(map(result => result ?? notFound(context.switchToHttp().getRequest<Request>().path)));
  }
}
