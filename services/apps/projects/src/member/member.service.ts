import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {UpdateMemberDto} from './member.dto';
import {Member, MemberDocument} from './member.schema';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('members') private model: Model<Member>,
  ) {
  }

  async findAll(where: FilterQuery<Member> = {}): Promise<MemberDocument[]> {
    return this.model.find(where).exec();
  }

  async findOne(projectId: string, userId: string): Promise<MemberDocument | null> {
    return this.model.findOne({projectId, userId}).exec();
  }

  async update(projectId: string, userId: string, dto: UpdateMemberDto): Promise<Member> {
    return this.model.findOneAndReplace({projectId, userId}, {...dto, projectId, userId}, {
      new: true,
      upsert: true,
    }).exec();
  }

  async remove(projectId: string, userId: string): Promise<MemberDocument | null> {
    return this.model.findOneAndDelete({projectId, userId}).exec();
  }

  async removeAll(where: FilterQuery<Member>): Promise<void> {
    await this.model.deleteMany(where).exec();
  }
}
