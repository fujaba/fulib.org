import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsMongoId, IsString} from 'class-validator';
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
  assignee: string;
}

export type AssigneeDocument = Assignee & Document;

export const AssigneeSchema = SchemaFactory.createForClass(Assignee)
  .index({assignment: 1, solution: 1}, {unique: true});
