import {Ref} from '@mean-stream/nestx';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Document, Types} from 'mongoose';

@Schema({_id: false, id: false})
export class Member {
  @Ref('')
  parent: Types.ObjectId;

  @Prop()
  @ApiProperty()
  user: string;
}

export type MemberDocument = Member & Document<Types.ObjectId, any, Member>;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({parent: 1})
  .index({user: 1})
  .index({parent: 1, user: 1}, {unique: true})
;
