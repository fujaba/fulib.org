import {Controller, Get, Param} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AssignmentStatistics} from './statistics.dto';
import {StatisticsService} from './statistics.service';
import {ObjectIdPipe} from "@mean-stream/nestx";
import {Types} from "mongoose";

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
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
  ): Promise<AssignmentStatistics> {
    return this.statisticsService.getAssignmentStatistics(assignment);
  }
}
