import {NotFoundException} from '@nestjs/common';
import {randomBytes} from 'crypto';

export function notFound(msg: string): never {
  throw new NotFoundException(msg);
}

export function generateToken(): string {
  const bytes = randomBytes(8);
  const hex = bytes.toString('hex');
  return new Array(4).fill(0).map((_, index) => hex.substr(index * 4, 4)).join('-');
}
