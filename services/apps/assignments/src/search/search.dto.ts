import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsArray, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
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

export class SearchParams {
  @ApiProperty({description: 'Code snippet to search for'})
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Lines of context. ' +
      'If unset, the `context` property of all results will be unset. ' +
      'If 0, the line on which the match was found will be included. ' +
      'Otherwise, there will be as many additional lines as specified both before and after the matching line.',
  })
  @IsOptional()
  @IsNumber()
  context?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  glob?: string;
}
