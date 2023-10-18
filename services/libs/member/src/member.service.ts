import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Member, MemberDocument} from './member.schema';
import {MongooseRepository} from "@mean-stream/nestx";

@Injectable()
export class MemberService extends MongooseRepository<Member, never, MemberDocument> {
  constructor(
    @InjectModel(Member.name) readonly model: Model<Member>,
  ) {
    super(model);
  }
}
