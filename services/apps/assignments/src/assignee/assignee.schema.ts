import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested} from 'class-validator';
import {Document, Types} from 'mongoose';
import {Type} from "class-transformer";
import {Ref} from "@mean-stream/nestx";

const OPTIONS = [1, 2, 3, 4];

export class Feedback {
  @IsOptional()
  @IsIn(OPTIONS)
  motivation?: number;

  @IsOptional()
  @IsIn(OPTIONS)
  exhaustion?: number;

  @IsOptional()
  @IsIn(OPTIONS)
  stress?: number;

  @IsOptional()
  @IsIn(OPTIONS)
  concentration?: number;

  @IsOptional()
  @IsIn(OPTIONS)
  ignoreDistraction?: number;
}

@Schema({id: false, _id: false})
export class Assignee {
  @Ref('Assignment', {index: 1})
  assignment: Types.ObjectId;

  @Ref('Solution', {index: 1})
  solution: Types.ObjectId;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assignee: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  duration?: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Feedback)
  feedback?: Feedback;
}

export type AssigneeDocument = Assignee & Document;

export const AssigneeSchema = SchemaFactory.createForClass(Assignee)
  .index({assignment: 1, solution: 1}, {unique: true});
