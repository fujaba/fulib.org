import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {SolutionDocument} from '../solution/solution.schema';
import {EvaluationService} from './evaluation.service';

@Injectable()
export class EvaluationHandler {
  constructor(
    private evaluationService: EvaluationService,
  ) {
  }

  @OnEvent('solution.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.evaluationService.removeAll({assignment: solution.assignment, solution: solution.id});
  }
}
