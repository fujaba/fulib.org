import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsArray, IsMongoId, ValidateNested} from 'class-validator';
import {Snippet} from '../evaluation/evaluation.schema';

export class SearchResult {
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @ApiProperty()
  @IsMongoId()
  solution: string;

  @ApiProperty({type: [Snippet]})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Snippet)
  snippets: Snippet[];
}
