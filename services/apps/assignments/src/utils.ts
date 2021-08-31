import {NotFoundException} from '@nestjs/common';

export function notFound(msg: string): never {
  throw new NotFoundException(msg);
}
