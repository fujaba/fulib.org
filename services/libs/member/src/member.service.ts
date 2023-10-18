import {Inject, Injectable, Logger, OnModuleInit, Optional} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model, Types} from 'mongoose';
import {UpdateMemberDto} from './member.dto';
import {Member, MemberDocument} from './member.schema';

@Injectable()
export class MemberService implements OnModuleInit {
  constructor(
    @InjectModel(Member.name) private model: Model<Member>,
    @Optional() @Inject() private logger = new Logger(MemberService.name),
  ) {
  }

  async onModuleInit() {
    const {modifiedCount} = await this.model.updateMany({
      projectId: {$type: 'string'},
    }, [{
      $set: {projectId: {$toObjectId: '$projectId'}},
    }]);
    modifiedCount && this.logger.warn(`Migrated ${modifiedCount} members`);
  }

  async findAll(where: FilterQuery<Member> = {}): Promise<MemberDocument[]> {
    return this.model.find(where).exec();
  }

  async findOne(projectId: Types.ObjectId, userId: string): Promise<MemberDocument | null> {
    return this.model.findOne({projectId, userId}).exec();
  }

  async update(projectId: Types.ObjectId, userId: string, dto: UpdateMemberDto): Promise<Member> {
    return this.model.findOneAndReplace({projectId, userId}, {...dto, projectId, userId}, {
      new: true,
      upsert: true,
    }).exec();
  }

  async remove(projectId: Types.ObjectId, userId: string): Promise<MemberDocument | null> {
    return this.model.findOneAndDelete({projectId, userId}).exec();
  }

  async removeAll(where: FilterQuery<Member>): Promise<void> {
    await this.model.deleteMany(where).exec();
  }
}
