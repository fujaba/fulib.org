import {ApiPropertyOptional, OmitType, PartialType} from '@nestjs/swagger';
import {IsAlphanumeric, IsBoolean, IsMongoId, IsOptional, IsString} from 'class-validator';
import {Evaluation} from './evaluation.schema';

export class CreateEvaluationDto extends OmitType(Evaluation, [
  'assignment',
  'solution',
  'createdAt',
  'createdBy',
  'updatedAt',
  'codeSearch',
] as const) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  codeSearch?: boolean;
}

export class UpdateEvaluationDto extends PartialType(CreateEvaluationDto) {
}

export class FilterEvaluationParams {
  @ApiPropertyOptional()
  @IsOptional()
  @IsAlphanumeric()
  task?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  codeSearch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file?: string;
}
