import {randomBytes} from 'crypto';
import {FilterQuery} from 'mongoose';

export function generateToken(): string {
  const bytes = randomBytes(8);
  const hex = bytes.toString('hex');
  return new Array(4).fill(0).map((_, index) => hex.substr(index * 4, 4)).join('-');
}

export function idFilter(id: string): FilterQuery<any> {
  return {$or: [{_id: id}, {id}]};
}
