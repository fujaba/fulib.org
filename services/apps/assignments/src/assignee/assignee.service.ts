import {EventService, MongooseRepository} from '@mean-stream/nestx';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';

import {Assignee, AssigneeDocument} from './assignee.schema';

@Injectable()
export class AssigneeService extends MongooseRepository<Assignee, never, AssigneeDocument> {
  constructor(
    @InjectModel(Assignee.name) model: Model<Assignee>,
    private eventService: EventService,
  ) {
    super(model);
  }

  private emit(event: string, assignee: AssigneeDocument) {
    this.eventService.emit(`assignments.${assignee.assignment}.solutions.${assignee.solution}.assignee.${event}`, assignee);
  }
}
