import {NotFound} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {UpdateAssigneeDto} from './assignee.dto';
import {Assignee} from './assignee.schema';
import {AssigneeService} from './assignee.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token';

@Controller()
@ApiTags('Assignees')
export class AssigneeController {
  constructor(
    private readonly assigneeService: AssigneeService,
  ) {
  }

  @Get('assignments/:assignment/assignees')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: [Assignee]})
  async findAll(
    @Param('assignment') assignment: string,
  ): Promise<Assignee[]> {
    return this.assigneeService.findAll({assignment}, {sort: {assignee: 1}});
  }

  @Get('assignments/:assignment/solutions/:solution/assignee')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async findOne(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
  ) {
    return this.assigneeService.findOne({assignment, solution});
  }

  @Put('assignments/:assignment/solutions/:solution/assignee')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async update(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Body() dto: UpdateAssigneeDto,
  ) {
    return this.assigneeService.upsert({assignment, solution}, dto);
  }

  @Delete('assignments/:assignment/solutions/:solution/assignee')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async remove(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
  ) {
    return this.assigneeService.deleteOne({assignment, solution});
  }
}
