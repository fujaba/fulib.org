import {Controller, Get, Param} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AssignmentStatistics} from './statistics.dto';
import {StatisticsService} from './statistics.service';

@Controller()
@ApiTags('Statistics')
export class StatisticsController {
  constructor(
    private statisticsService: StatisticsService,
  ) {
  }

  @Get('assignments/:assignment/statistics')
  @ApiOperation({summary: 'Get statistics for an assignment'})
  @ApiOkResponse({type: AssignmentStatistics})
  async getAssignmentStatistics(
    @Param('assignment') assignment: string,
  ): Promise<AssignmentStatistics> {
    return this.statisticsService.getAssignmentStatistics(assignment);
  }
}
