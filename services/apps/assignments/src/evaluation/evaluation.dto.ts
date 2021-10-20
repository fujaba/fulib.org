import {PartialType} from '@nestjs/swagger';
import {OmitType} from '@nestjs/swagger';
import {Evaluation} from './evaluation.schema';

export class CreateEvaluationDto extends OmitType(Evaluation, [
  'assignment',
  'solution',
] as const) {
}

export class UpdateEvaluationDto extends PartialType(CreateEvaluationDto) {
}
