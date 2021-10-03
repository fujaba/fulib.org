import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {UpdateGradingDto} from './grading.dto';
import {Grading, GradingDocument} from './grading.schema';

@Injectable()
export class GradingService {
  constructor(
    @InjectModel('gradings') private model: Model<Grading>,
    @InjectConnection() private connection: Connection,
  ) {
    this.migrate();
  }

  async migrate() {
    const collection = this.connection.collection('gradings');
    const result = await collection.updateMany({}, {$rename: {
      // TODO id: '_id'
      solutionID: 'solution',
      taskID: 'task',
      userId: 'createdBy',
      timeStamp: 'timestamp',
    }});
    console.info('Migrated', result.modifiedCount, 'gradings');
  }

  async findAll(where: FilterQuery<Grading> = {}): Promise<GradingDocument[]> {
    return this.model.find(where).sort('+task').exec();
  }

  async findOne(where: FilterQuery<Grading>): Promise<GradingDocument | null> {
    return this.model.findOne(where).exec();
  }

  async update(where: Pick<Grading, 'assignment' | 'solution' | 'task'>, dto: UpdateGradingDto, createdBy?: string): Promise<Grading | null> {
    return this.model.findOneAndUpdate(where, {
      ...dto,
      ...where,
      createdBy,
      timestamp: new Date(),
    } as Grading, {new: true, upsert: true}).exec();
  }

  async remove(where: FilterQuery<Grading>): Promise<GradingDocument | null> {
    return this.model.findOneAndDelete(where).exec();
  }
}
