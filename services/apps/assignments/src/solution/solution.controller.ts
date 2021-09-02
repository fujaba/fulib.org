import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, ForbiddenException, Get, Headers, Param, Patch, Post} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {AssignmentService} from '../assignment/assignment.service';
import {notFound} from '../utils';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SolutionDocument} from './solution.schema';
import {SolutionService} from './solution.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';

@Controller('assignments/:assignment/solutions')
@ApiTags('Solutions')
export class SolutionController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly solutionService: SolutionService,
  ) {
  }

  @Post()
  @Auth({optional: true})
  @ApiCreatedResponse({type: Solution})
  async create(
    @Param('assignment') assignment: string,
    @Body() dto: CreateSolutionDto,
    @AuthUser() user?: UserToken,
  ) {
    return this.solutionService.create(assignment, dto, user?.sub);
  }

  @Get()
  @ApiOkResponse({type: [ReadSolutionDto]})
  async findAll(
    @Param('assignment') assignment: string,
  ): Promise<ReadSolutionDto[]> {
    return this.solutionService.findAll({assignment});
  }

  @Get(':id')
  @Auth({optional: true})
  @ApiOkResponse({
    description: 'The token property is omitted.',
    type: ReadSolutionDto,
  })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'solution-token', required: false})
  @ApiHeader({name: 'assignment-token', required: false})
  async findOne(
    @Param('assignment') assignmentId: string,
    @Param('id') id: string,
    @Headers('assignment-token') assignmentToken?: string,
    @Headers('solution-token') solutionToken?: string,
    @AuthUser() user?: UserToken,
  ): Promise<ReadSolutionDto> {
    const solution = await this.checkAuth(assignmentId, id, user, assignmentToken, solutionToken);
    return this.solutionService.mask(solution.toObject());
  }

  @Patch(':id')
  @Auth({optional: true})
  @ApiOkResponse({type: ReadSolutionDto})
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'assignment-token', required: false})
  @ApiHeader({name: 'solution-token', required: false})
  async update(
    @Param('assignment') assignmentId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSolutionDto,
    @Headers('assignment-token') assignmentToken?: string,
    @Headers('solution-token') solutionToken?: string,
    @AuthUser() user?: UserToken,
  ): Promise<ReadSolutionDto> {
    await this.checkAuth(assignmentId, id, user, assignmentToken, solutionToken);
    const solution = await this.solutionService.update(id, dto);
    if (!solution) {
      notFound(id);
    }
    return this.solutionService.mask(solution);
  }

  @Delete(':id')
  @Auth({optional: true})
  @ApiOkResponse({type: ReadSolutionDto})
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({description: forbiddenResponse})
  @ApiHeader({name: 'assignment-token', required: false})
  @ApiHeader({name: 'solution-token', required: false})
  async remove(
    @Param('assignment') assignmentId: string,
    @Param('id') id: string,
    @Headers('assignment-token') assignmentToken?: string,
    @Headers('solution-token') solutionToken?: string,
    @AuthUser() user?: UserToken,
  ): Promise<ReadSolutionDto> {
    await this.checkAuth(assignmentId, id, user, assignmentToken, solutionToken);
    const solution = await this.solutionService.remove(id);
    if (!solution) {
      notFound(id);
    }
    return this.solutionService.mask(solution.toObject());
  }

  private async checkAuth(assignmentId: string, solutionId: string, user: UserToken, assignmentToken: string, solutionToken: string): Promise<SolutionDocument> {
    const assignment = await this.assignmentService.findOne(assignmentId);
    if (!assignment) {
      notFound(assignmentId);
    }

    const solution = await this.solutionService.findOne(solutionId);
    if (!solution) {
      notFound(solutionId);
    }

    const privileged = this.assignmentService.isAuthorized(assignment, assignmentToken, user);
    const authorized = this.solutionService.isAuthorized(solution, solutionToken, user);
    if (!(privileged || authorized)) {
      throw new ForbiddenException(forbiddenResponse);
    }
    return solution;
  }
}
