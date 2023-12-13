import {EventRepository, EventService, MongooseRepository} from '@mean-stream/nestx';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';

import {Assignee, AssigneeDocument} from './assignee.schema';
import {BulkUpdateAssigneeDto} from "./assignee.dto";

@Injectable()
@EventRepository()
export class AssigneeService extends MongooseRepository<Assignee, never, AssigneeDocument> {
  constructor(
    @InjectModel(Assignee.name) public model: Model<Assignee, object, object, object, AssigneeDocument>,
    private eventService: EventService,
  ) {
    super(model);
  }

  private emit(event: string, assignee: AssigneeDocument) {
    this.eventService.emit(`assignments.${assignee.assignment}.solutions.${assignee.solution}.assignee.${event}`, assignee);
  }

  async upsertMany(assignment: Types.ObjectId, dtos: BulkUpdateAssigneeDto[]): Promise<AssigneeDocument[]> {
    return Promise.all(dtos.map(dto => this.upsert({assignment, solution: dto.solution}, dto)));
  }
}
