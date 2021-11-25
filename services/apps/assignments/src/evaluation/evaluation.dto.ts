import {ApiPropertyOptional, OmitType, PartialType} from '@nestjs/swagger';
import {IsBoolean, IsOptional} from 'class-validator';
import {Evaluation} from './evaluation.schema';

export class CreateEvaluationDto extends OmitType(Evaluation, [
  'assignment',
  'solution',
  'createdAt',
  'createdBy',
  'updatedAt',
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  codeSearch?: boolean;
}

export class UpdateEvaluationDto extends PartialType(CreateEvaluationDto) {
}
