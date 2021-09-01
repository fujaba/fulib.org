import {NotFoundException} from '@nestjs/common';
import {randomBytes} from 'crypto';

export function notFound(msg: string): never {
  throw new NotFoundException(msg);
}

export function generateToken(): string {
  const bytes = randomBytes(8);
  const hex = bytes.toString('hex');
  const [, a, b, c, d] = /(.{4})(.{4})(.{4})(.{4})/.exec(hex);
  return `${a}-${b}-${c}-${d}`;
}
