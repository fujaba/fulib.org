import {Module} from '@nestjs/common';
import {NotFoundInterceptor} from './not-found.interceptor';

@Module({
  providers: [NotFoundInterceptor],
  exports: [NotFoundInterceptor],
})
export class NotFoundModule {
}
