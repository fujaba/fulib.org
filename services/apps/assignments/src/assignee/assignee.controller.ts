import {NotFound} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentService} from '../assignment/assignment.service';
import {UpdateAssigneeDto} from './assignee.dto';
import {Assignee} from './assignee.schema';
import {AssigneeService} from './assignee.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token';

@Controller()
@ApiTags('Assignees')
export class AssigneeController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly assigneeService: AssigneeService,
  ) {
  }

  @Get('assignments/:assignment/assignees')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: [Assignee]})
  async findAll(
    @Param('assignment') assignment: string,
  ): Promise<Assignee[]> {
    return this.assigneeService.findAll({assignment});
  }

  @Get('assignments/:assignment/solutions/:solution/assignee')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async findOne(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
  ) {
    return this.assigneeService.findOne(assignmentId, solutionId);
  }

  @Put('assignments/:assignment/solutions/:solution/assignee')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async update(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
    @Body() dto: UpdateAssigneeDto,
  ) {
    return this.assigneeService.update(assignmentId, solutionId, dto);
  }

  @Delete('assignments/:assignment/solutions/:solution/assignee')
  @NotFound()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async remove(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
  ) {
    return this.assigneeService.remove(assignmentId, solutionId);
  }
}
