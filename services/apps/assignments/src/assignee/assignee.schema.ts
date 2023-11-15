import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsIn, IsMongoId, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested} from 'class-validator';
import {Document} from 'mongoose';
import {Type} from "class-transformer";

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
  @Prop({index: 1})
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @Prop({index: 1})
  @ApiProperty()
  @IsMongoId()
  solution: string;

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
