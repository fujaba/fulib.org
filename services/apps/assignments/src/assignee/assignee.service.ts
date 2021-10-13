import {Injectable} from '@nestjs/common';
import {InjectConnection, InjectModel} from '@nestjs/mongoose';
import {Connection, FilterQuery, Model} from 'mongoose';
import {UpdateAssigneeDto} from './assignee.dto';

import {Assignee, AssigneeDocument} from './assignee.schema';

@Injectable()
export class AssigneeService {
  constructor(
    @InjectModel('assignee') private model: Model<Assignee>,
    @InjectConnection() private connection: Connection,
  ) {
    this.migrate();
  }

  async migrate() {
    const collection = this.connection.collection('assignee');
    const result = await collection.updateMany({}, {
      $rename: {
        id: 'solution',
      },
    });
    console.info('Migrated', result.modifiedCount, 'assignees');
  }

  async findAll(where: FilterQuery<Assignee> = {}): Promise<AssigneeDocument[]> {
    return this.model.find(where).sort('+assignee').exec();
  }

  async findOne(assignment: string, solution: string): Promise<AssigneeDocument | null> {
    return this.model.findOne({assignment, solution}).exec();
  }

  async update(assignment: string, solution: string, dto: UpdateAssigneeDto): Promise<AssigneeDocument | null> {
    return this.model.findOneAndReplace({assignment, solution}, {
      ...dto,
      assignment,
      solution,
    }, {new: true, upsert: true}).exec();
  }

  async remove(assignment: string, solution: string): Promise<AssigneeDocument | null> {
    return this.model.findOneAndDelete({assignment, solution}).exec();
  }
}
