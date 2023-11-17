import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsDateString, IsEmail, IsMongoId, IsNotEmpty, IsString} from 'class-validator';
import {Doc, Ref} from "@mean-stream/nestx";
import {Types} from "mongoose";

@Schema()
export class Comment {
  @Ref('Assignment')
  assignment: Types.ObjectId;

  @Ref('Assignment')
  solution: Types.ObjectId;

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
