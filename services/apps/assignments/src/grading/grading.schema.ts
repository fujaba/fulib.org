import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {Document} from 'mongoose';

@Schema({id: false, _id: false})
export class Grading {
  @Prop()
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @Prop()
  @ApiProperty()
  @IsMongoId()
  solution: string;

  @Prop()
  @ApiProperty({type: 'integer'})
  @IsAlphanumeric()
  @IsNotEmpty()
  task: string;

  @Prop()
  @ApiProperty()
  @IsDateString()
  timestamp: Date;

  @Prop()
  @ApiProperty()
  @IsOptional()
  @IsString()
  createdBy?: string;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  author: string;

  @Prop()
  @ApiProperty()
  @IsString()
  note: string;

  @Prop()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  points: number;
}

export type GradingDocument = Grading & Document;

export const GradingSchema = SchemaFactory.createForClass(Grading)
  .index({assignment: 1, solution: 1, task: 1}, {unique: true});
