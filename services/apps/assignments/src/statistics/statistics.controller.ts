import {Controller, Get, Param} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentStatistics} from './statistics.dto';
import {StatisticsService} from './statistics.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token';

@Controller()
@ApiTags('statistics')
export class StatisticsController {
  constructor(
    private statisticsService: StatisticsService,
  ) {
  }

  @Get('assignments/:assignment/statistics')
  @ApiOkResponse({type: AssignmentStatistics})
  @AssignmentAuth({forbiddenResponse})
  async getAssignmentStatistics(
    @Param('assignment') assignment: string,
  ): Promise<AssignmentStatistics> {
    return this.statisticsService.getAssignmentStatistics(assignment);
  }
}
