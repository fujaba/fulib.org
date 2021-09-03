import {OmitType} from '@nestjs/swagger';
import {Grading} from './grading.schema';

export class UpdateGradingDto extends OmitType(Grading, [
  'assignment',
  'solution',
  'task',
  'timestamp',
  'creator',
] as const) {
}
