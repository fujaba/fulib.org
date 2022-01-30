import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {SearchParams, SearchResult} from './search.dto';
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
  async findCode(
    @Param('assignment') assignment: string,
    @Query() params: SearchParams,
  ): Promise<SearchResult[]> {
    return this.searchService.find(assignment, params);
  }
}
