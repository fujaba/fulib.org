import {Ref} from '@mean-stream/nestx';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Document, Types} from 'mongoose';
import {Project} from '../../../apps/projects/src/project/project.schema';

@Schema({_id: false, id: false})
export class Member {
  @Ref(Project.name)
  projectId: Types.ObjectId;

  @Prop()
  @ApiProperty()
  userId: string;
}

export type MemberDocument = Member & Document<Types.ObjectId, any, Member>;

export const MemberSchema = SchemaFactory.createForClass(Member)
  .index({projectId: 1})
  .index({userId: 1})
  .index({projectId: 1, userId: 1}, {unique: true})
;
