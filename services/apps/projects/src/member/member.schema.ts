import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsMongoId} from 'class-validator';
import {Document} from 'mongoose';

@Schema({_id: false, id: false})
export class Member {
  @Prop({index: 1})
  @ApiProperty()
  @IsMongoId()
  projectId: string;

  @Prop()
  @ApiProperty()
  userId: string;
}

export type MemberDocument = Member & Document;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({projectId: 1, userId: 1}, {unique: true});
