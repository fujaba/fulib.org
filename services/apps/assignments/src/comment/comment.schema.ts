import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsDateString, IsEmail, IsMongoId, IsNotEmpty, IsString} from 'class-validator';
import {Document} from 'mongoose';

@Schema()
export class Comment {
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
  createdBy?: string;

  @Prop({index: 1})
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  author: string;

  @Prop()
  @ApiProperty()
  @IsEmail()
  email: string;

  @Prop()
  @ApiProperty()
  @IsDateString()
  timestamp: Date;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;

  @Prop()
  @ApiProperty()
  @IsBoolean()
  distinguished: boolean;
}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);
