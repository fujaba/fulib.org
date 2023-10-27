import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {SolutionDocument} from '../solution/solution.schema';
import {AssigneeService} from './assignee.service';

@Injectable()
export class AssigneeHandler {
  constructor(
    private assigneeService: AssigneeService,
  ) {
  }

  @OnEvent('assignments.*.solutions.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.assigneeService.deleteOne({assignment: solution.assignment, solution: solution.id});
  }
}
