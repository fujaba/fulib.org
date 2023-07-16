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

  @OnEvent('assignments.*.deleted')
  async onAssignmentDeleted(assignment: AssignmentDocument) {
    await this.solutionService.removeAll({assignment: assignment.id});
  }
}
