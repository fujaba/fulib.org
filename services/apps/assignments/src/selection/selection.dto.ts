import {ApiProperty, OmitType} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsMongoId, IsString, ValidateNested} from 'class-validator';
import {Snippet} from '../evaluation/evaluation.schema';

export class SelectionDto {
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @ApiProperty()
  @IsMongoId()
  solution: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => Snippet)
  snippet: Snippet;
}

export class CreateSelectionDto extends OmitType(SelectionDto, ['assignment', 'solution'] as const) {
}
