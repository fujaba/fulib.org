import {PartialType} from '@nestjs/swagger';
import {OmitType} from '@nestjs/swagger';
import {Evaluation} from './evaluation.schema';

export class CreateEvaluationDto extends OmitType(Evaluation, [
  'assignment',
  'solution',
  'createdAt',
  'createdBy',
  'updatedAt',
] as const) {
}

export class UpdateEvaluationDto extends PartialType(CreateEvaluationDto) {
}
