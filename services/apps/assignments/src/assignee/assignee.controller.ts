import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, ForbiddenException, Get, Headers, Param, Put} from '@nestjs/common';
import {ApiForbiddenResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
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
  @Auth({optional: true})
  @ApiOkResponse({type: Assignee})
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'assignment-token', required: false})
  async findOne(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
    @Headers('assignment-token') assignmentToken?: string,
    @AuthUser() user?: UserToken,
  ) {
    await this.checkAssignment(assignmentId, assignmentToken, user);
    return await this.assigneeService.findOne(assignmentId, solutionId) ?? notFound(`${assignmentId} ${solutionId}`);
  }

  @Put()
  @Auth({optional: true})
  @ApiOkResponse({type: Assignee})
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'assignment-token', required: false})
  async update(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
    @Body() dto: UpdateAssigneeDto,
    @Headers('assignment-token') assignmentToken?: string,
    @AuthUser() user?: UserToken,
  ) {
    await this.checkAssignment(assignmentId, assignmentToken, user);
    return this.assigneeService.update(assignmentId, solutionId, dto);
  }

  @Delete()
  @Auth({optional: true})
  @ApiOkResponse({type: Assignee})
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'assignment-token', required: false})
  async remove(
    @Param('assignment') assignmentId: string,
    @Param('solution') solutionId: string,
    @Headers('assignment-token') assignmentToken?: string,
    @AuthUser() user?: UserToken,
  ) {
    await this.checkAssignment(assignmentId, assignmentToken, user);
    return this.assigneeService.remove(assignmentId, solutionId);
  }

  private async checkAssignment(assignmentId: string, assignmentToken: string, user: UserToken) {
    const assignment = await this.assignmentService.findOne(assignmentId);
    if (!assignment) {
      notFound(assignmentId);
    }

    const privileged = this.assignmentService.isAuthorized(assignment, assignmentToken, user);
    if (!privileged) {
      throw new ForbiddenException(forbiddenResponse);
    }
  }
}
