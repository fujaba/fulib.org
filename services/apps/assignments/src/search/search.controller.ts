import {Controller, Get, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOkResponse, ApiQuery, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {SearchResult} from './search.dto';
import {SearchService} from './search.service';

const forbiddenResponse = 'Not owner or invalid Assignment-Token.';

@Controller('assignments/:assignment/search')
@ApiTags('Code Search')
export class SearchController {
  constructor(
    private searchService: SearchService,
  ) {
  }

  @Get()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: [SearchResult]})
  @ApiQuery({name: 'q', description: 'Code snippet to search for'})
  @ApiQuery({
    name: 'context',
    required: false,
    description: 'Lines of context. ' +
      'If unset, the `context` property of all results will be unset. ' +
      'If 0, the line on which the match was found will be included. ' +
      'Otherwise, there will be as many additional lines as specified both before and after the matching line.',
  })
  async findCode(
    @Param('assignment') assignment: string,
    @Query('q') code: string,
    @Query('context', ParseIntPipe) context?: number,
  ): Promise<SearchResult[]> {
    return this.searchService.find(assignment, code, context);
  }
}
