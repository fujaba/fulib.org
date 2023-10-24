import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {SolutionDocument} from '../solution/solution.schema';
import {SearchService} from './search.service';

@Injectable()
export class SearchHandler {
  constructor(
    private searchService: SearchService,
  ) {
  }

  @OnEvent('assignments.*.solutions.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.searchService.deleteAll(solution.assignment, solution.id);
  }
}
