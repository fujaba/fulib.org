import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsArray, IsMongoId, IsString, ValidateNested} from 'class-validator';
import {Snippet} from '../evaluation/evaluation.schema';

export class SearchSnippet extends Snippet {
  @ApiProperty()
  @IsString()
  context: string;
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
