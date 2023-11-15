import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsDateString, IsEmail, IsMongoId, IsNotEmpty, IsString} from 'class-validator';
import {Doc} from "@mean-stream/nestx";

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

  @Prop()
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

export type CommentDocument = Doc<Comment>;

export const CommentSchema = SchemaFactory.createForClass(Comment)
  .index({assignment: 1, solution: 1})
;
