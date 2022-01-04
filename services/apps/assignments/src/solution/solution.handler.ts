import {EventPayload} from '@app/event/event.interface';
import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {AssignmentDocument} from '../assignment/assignment.schema';
import {SolutionService} from './solution.service';

@Injectable()
export class SolutionHandler {
  constructor(
    private solutionService: SolutionService,
  ) {
  }

  @OnEvent('assignment.*.deleted')
  async onAssignmentDeleted({data: assignment}: EventPayload<AssignmentDocument>) {
    await this.solutionService.removeAll({assignment: assignment._id});
  }
}
