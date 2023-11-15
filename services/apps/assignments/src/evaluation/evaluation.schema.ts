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
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {Document, Types} from 'mongoose';
import {OptionalRef, Ref} from "@mean-stream/nestx";

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
  @ApiPropertyOptional({description: 'Only in GET responses'})
  @OptionalRef('Evaluation')
  origin?: Types.ObjectId;

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
  _id: Types.ObjectId;

  @Ref('Assignment')
  assignment: Types.ObjectId;

  @Ref('Solution', {index: 1})
  solution: Types.ObjectId;

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
  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  duration?: number;

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
