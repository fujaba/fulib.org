import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString
} from "class-validator";

export class EmbeddingEstimate {
  @ApiProperty()
  @IsInt()
  solutions: number;

  @ApiProperty()
  @IsInt()
  files: number;

  @ApiProperty()
  @IsInt()
  tokens: number;

  @ApiProperty()
  @IsNumber({maxDecimalPlaces: 2})
  estimatedCost: number;

  @ApiProperty()
  @IsArray()
  @IsString({each: true})
  functions: string[];

  @ApiProperty()
  @IsArray()
  @IsString({each: true})
  ignoredFiles: string[];

  @ApiProperty()
  @IsArray()
  @IsString({each: true})
  ignoredFunctions: string[];
}

export class EmbeddableBase {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsIn(['task', 'snippet'])
  type: string;

  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsNumber({}, {each: true})
  @ArrayMinSize(1536)
  @ArrayMaxSize(1536)
  embedding: number[];
}

export class TaskEmbeddable extends EmbeddableBase {
  @ApiProperty()
  type: 'task';

  @ApiProperty()
  @IsMongoId()
  task: string;
}

export class SnippetEmbeddable extends EmbeddableBase {
  @ApiProperty()
  type: 'snippet';

  @ApiProperty()
  @IsMongoId()
  solution: string;

  @ApiProperty()
  @IsString()
  file: string;

  @ApiProperty()
  @IsInt()
  line: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export type Embeddable = TaskEmbeddable | SnippetEmbeddable;

export type EmbeddableSearch = Partial<Embeddable>;
