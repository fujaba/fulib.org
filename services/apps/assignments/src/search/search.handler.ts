import {EventPayload} from '@app/event/event.interface';
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

  @OnEvent('solution.*.deleted')
  async onSolutionDeleted({data: solution}: EventPayload<SolutionDocument>) {
    await this.searchService.deleteAll(solution.assignment, solution.id);
  }
}
