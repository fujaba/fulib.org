import {Prop, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsArray, IsMongoId} from 'class-validator';
import {Document} from 'mongoose';

export class Course {
  @Prop()
  @ApiProperty()
  userId: string;

  @Prop()
  @ApiProperty()
  title: string;

  @Prop()
  @ApiProperty()
  description: string;

  @Prop()
  @ApiProperty()
  @IsArray()
  @IsMongoId({each: true})
  assignmentIds: string[];
}

export type CourseDocument = Course & Document;

export const CourseSchema = SchemaFactory.createForClass(Course);
