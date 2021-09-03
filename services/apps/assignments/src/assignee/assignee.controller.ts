import {Body, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentService} from '../assignment/assignment.service';
import {notFound} from '../utils';
import {UpdateAssigneeDto} from './assignee.dto';
import {Assignee} from './assignee.schema';
import {AssigneeService} from './assignee.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token';

@Controller('assignments/:assignment/solutions/:solution/assignee')
@ApiTags('Assignees')
export class AssigneeController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly assigneeService: AssigneeService,
  ) {
  }

  @Get()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  @ApiNotFoundResponse()
  async findOne(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
  ) {
    return await this.assigneeService.findOne(assignmentId, solutionId) ?? notFound(`${assignmentId} ${solutionId}`);
  }

  @Put()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async update(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
    @Body() dto: UpdateAssigneeDto,
  ) {
    return this.assigneeService.update(assignmentId, solutionId, dto);
  }

  @Delete()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: Assignee})
  async remove(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
  ) {
    return this.assigneeService.remove(assignmentId, solutionId);
  }
}
