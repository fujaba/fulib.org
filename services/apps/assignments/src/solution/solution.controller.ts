import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, notFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {FilterQuery} from 'mongoose';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentService} from '../assignment/assignment.service';
import {SolutionAuth} from './solution-auth.decorator';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution} from './solution.schema';
import {SolutionService} from './solution.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller()
@ApiTags('Solutions')
export class SolutionController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly solutionService: SolutionService,
  ) {
  }

  @Post('assignments/:assignment/solutions')
  @Auth({optional: true})
  @ApiCreatedResponse({type: Solution})
  async create(
    @Param('assignment') assignment: string,
    @Body() dto: CreateSolutionDto,
    @AuthUser() user?: UserToken,
  ): Promise<Solution> {
    const solution = await this.solutionService.create(assignment, dto, user?.sub);
    await this.solutionService.autoGrade(solution);
    return solution;
  }

  @Get('assignments/:assignment/solutions')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [ReadSolutionDto]})
  async findAll(
    @Param('assignment') assignment: string,
    @Query('author.github') github?: string,
  ): Promise<ReadSolutionDto[]> {
    const query: FilterQuery<Solution> = {assignment};
    github && (query['author.github'] = github);
    return this.solutionService.findAll(query);
  }

  @Get('assignments/:assignment/solutions/:id')
  @SolutionAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Solution})
  async findOne(
    @Param('id') id: string,
  ): Promise<Solution | null> {
    return this.solutionService.findOne(id);
  }

  @Get('solutions')
  @Auth()
  @ApiOkResponse({type: [ReadSolutionDto]})
  async findOwn(
    @AuthUser() user: UserToken,
  ): Promise<ReadSolutionDto[]> {
    return this.solutionService.findAll({createdBy: user.sub});
  }

  @Patch('assignments/:assignment/solutions/:id')
  @SolutionAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Solution})
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSolutionDto,
  ): Promise<Solution | null> {
    return this.solutionService.update(id, dto);
  }

  @Delete('assignments/:assignment/solutions/:id')
  @SolutionAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Solution})
  async remove(
    @Param('id') id: string,
  ): Promise<Solution | null> {
    return this.solutionService.remove(id);
  }
}
