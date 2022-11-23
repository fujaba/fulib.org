import {ApiProperty, ApiPropertyOptional, OmitType, PartialType, PickType} from '@nestjs/swagger';
import {Transform} from 'class-transformer';
import {IsAlphanumeric, IsBoolean, IsMongoId, IsOptional, IsString} from 'class-validator';
import {Evaluation} from './evaluation.schema';

export class CreateEvaluationDto extends OmitType(Evaluation, [
  'assignment',
  'solution',
  '_id',
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
  @Transform(({value}) => value === true || value === 'true')
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

export class RemarkDto extends PickType(Evaluation, ['remark', 'points'] as const) {
  @ApiProperty()
  count: number;
}
