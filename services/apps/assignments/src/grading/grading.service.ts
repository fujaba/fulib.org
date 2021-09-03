import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {UpdateGradingDto} from './grading.dto';
import {Grading, GradingDocument} from './grading.schema';

@Injectable()
export class GradingService {
  constructor(
    @InjectModel('gradings') private model: Model<Grading>,
  ) {
  }

  async findAll(where?: FilterQuery<Grading>): Promise<GradingDocument[]> {
    return this.model.find(where).sort(['+task']).exec();
  }

  async findOne(where: FilterQuery<Grading>): Promise<GradingDocument | undefined> {
    return this.model.findOne(where).exec();
  }

  async update(where: Pick<Grading, 'assignment' | 'solution' | 'task'>, dto: UpdateGradingDto, creator?: string): Promise<Grading | undefined> {
    return this.model.findOneAndUpdate(where, {
      ...dto,
      ...where,
      creator,
      timestamp: new Date(),
    } as Grading, {new: true, upsert: true}).exec();
  }

  async remove(where: FilterQuery<Grading>): Promise<GradingDocument | undefined> {
    return this.model.findOneAndDelete(where);
  }
}
