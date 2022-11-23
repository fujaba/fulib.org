import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsAlphanumeric,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {Document} from 'mongoose';

export class Location {
  @Prop()
  @ApiProperty({type: 'integer', minimum: 0})
  @IsInt()
  @Min(0)
  line: number;

  @Prop()
  @ApiProperty({type: 'integer', minimum: 0})
  @IsInt()
  @Min(0)
  character: number;
}

export class Snippet {
  @Prop()
  @ApiProperty()
  @IsString()
  file: string;

  @Prop()
  @ApiProperty()
  @ValidateNested()
  @Type(() => Location)
  from: Location;

  @Prop()
  @ApiProperty()
  @ValidateNested()
  @Type(() => Location)
  to: Location;

  @Prop()
  @ApiProperty()
  @IsString()
  code: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pattern?: string;

  @Prop()
  @ApiProperty()
  @IsString()
  comment: string;
}

export class CodeSearchInfo {
  @Prop()
  @ApiPropertyOptional({description: 'Only in GET responses'})
  @IsOptional()
  @IsMongoId()
  origin?: string;

  @ApiPropertyOptional({description: 'Only in POST response'})
  @IsOptional()
  @IsInt()
  created?: number;

  @ApiPropertyOptional({description: 'Only in PUT response'})
  @IsOptional()
  @IsInt()
  updated?: number;

  @ApiPropertyOptional({description: 'Only in PUT response'})
  @IsOptional()
  @IsInt()
  deleted?: number;
}

@Schema({timestamps: true})
export class Evaluation {
  @ApiProperty()
  _id: string;

  @Prop()
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @Prop()
  @ApiProperty()
  @IsMongoId()
  solution: string;

  @Prop()
  @ApiProperty()
  @IsAlphanumeric()
  @IsNotEmpty()
  task: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @Prop()
  @ApiProperty({minLength: 1})
  @IsString()
  @IsNotEmpty()
  author: string;

  @Prop()
  @ApiProperty()
  @IsString()
  remark: string;

  @Prop()
  @ApiProperty()
  @IsNumber()
  points: number;

  @Prop()
  @ApiProperty({type: [Snippet]})
  @ValidateNested({each: true})
  @Type(() => Snippet)
  snippets: Snippet[];

  @Prop()
  @ApiPropertyOptional({type: CodeSearchInfo})
  @IsOptional()
  @ValidateNested()
  @Type(() => CodeSearchInfo)
  codeSearch?: CodeSearchInfo;
}

export type EvaluationDocument = Evaluation & Document;

export const EvaluationSchema = SchemaFactory.createForClass(Evaluation)
  .index({assignment: 1, solution: 1})
  .index({assignment: 1, solution: 1, 'snippets.file': 1})
  .index({assignment: 1, solution: 1, 'codeSearch.origin': 1})
  .index({assignment: 1, solution: 1, task: 1}, {unique: true})
;
