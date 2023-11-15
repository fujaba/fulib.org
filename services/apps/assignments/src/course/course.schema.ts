import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUUID} from 'class-validator';
import {Types} from 'mongoose';
import {Doc} from "@mean-stream/nestx";

@Schema()
export class Course {
  @ApiProperty()
  _id: Types.ObjectId;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  createdBy?: string;

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

export type CourseDocument = Doc<Course>;

export const CourseSchema = SchemaFactory.createForClass(Course);
