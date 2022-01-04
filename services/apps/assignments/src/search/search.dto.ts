import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsArray, IsMongoId, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Snippet} from '../evaluation/evaluation.schema';

export class SearchSnippet extends Snippet {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  context?: string;
}

export class SearchResult {
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @ApiProperty()
  @IsMongoId()
  solution: string;

  @ApiProperty({type: [SearchSnippet]})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => SearchSnippet)
  snippets: SearchSnippet[];
}
