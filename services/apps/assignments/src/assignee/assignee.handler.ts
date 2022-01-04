import {EventPayload} from '@app/event/event.interface';
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

  @OnEvent('solution.*.deleted')
  async onSolutionDeleted({data: solution}: EventPayload<SolutionDocument>) {
    await this.assigneeService.remove(solution.assignment, solution._id);
  }
}
