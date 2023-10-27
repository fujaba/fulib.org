import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsMongoId, IsNotEmpty, IsOptional, IsPositive, IsString} from 'class-validator';
import {Document} from 'mongoose';

@Schema({id: false, _id: false})
export class Assignee {
  @Prop({index: 1})
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @Prop()
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
}

export type AssigneeDocument = Assignee & Document;

export const AssigneeSchema = SchemaFactory.createForClass(Assignee)
  .index({assignment: 1, solution: 1}, {unique: true});
