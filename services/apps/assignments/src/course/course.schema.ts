import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsArray, IsMongoId, IsNotEmpty, IsString} from 'class-validator';
import {Document} from 'mongoose';

@Schema()
export class Course {
  @Prop()
  @ApiProperty()
  createdBy: string;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Prop()
  @ApiProperty()
  @IsString()
  description: string;

  @Prop()
  @ApiProperty()
  @IsArray()
  @IsMongoId({each: true})
  assignments: string[];
}

export type CourseDocument = Course & Document;

export const CourseSchema = SchemaFactory.createForClass(Course);
