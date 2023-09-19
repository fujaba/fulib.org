import {Controller, Get, Param} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
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
  @ApiOkResponse({type: AssignmentStatistics})
  async getAssignmentStatistics(
    @Param('assignment') assignment: string,
  ): Promise<AssignmentStatistics> {
    return this.statisticsService.getAssignmentStatistics(assignment);
  }
}
