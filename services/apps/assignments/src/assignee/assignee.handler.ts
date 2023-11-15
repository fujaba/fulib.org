import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {SolutionDocument} from '../solution/solution.schema';
import {AssigneeService} from './assignee.service';
import {Types} from "mongoose";

@Injectable()
export class AssigneeHandler {
  constructor(
    private assigneeService: AssigneeService,
  ) {
  }

  @OnEvent('assignments.*.solutions.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.assigneeService.deleteOne({
      assignment: new Types.ObjectId(solution.assignment),
      solution: solution._id,
    });
  }
}
