import {EventService} from '@mean-stream/nestx';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {UpdateAssigneeDto} from './assignee.dto';

import {Assignee, AssigneeDocument} from './assignee.schema';

@Injectable()
export class AssigneeService {
  constructor(
    @InjectModel('assignee') private model: Model<Assignee>,
    private eventService: EventService,
  ) {
    this.migrate();
  }

  async migrate() {
    const result = await this.model.updateMany({}, {
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
    const updated = await this.model.findOneAndReplace({assignment, solution}, {
      ...dto,
      assignment,
      solution,
    }, {new: true, upsert: true}).exec();
    this.emit('updated', updated);
    return updated;
  }

  async remove(assignment: string, solution: string): Promise<AssigneeDocument | null> {
    const deleted = await this.model.findOneAndDelete({assignment, solution}).exec();
    deleted && this.emit('deleted', deleted);
    return deleted;
  }

  private emit(event: string, assignee: AssigneeDocument) {
    this.eventService.emit(`assignments.${assignee.assignment}.solutions.${assignee.solution}.assignee.${event}`, assignee);
  }
}
