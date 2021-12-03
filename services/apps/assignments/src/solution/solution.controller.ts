import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags} from '@nestjs/swagger';
import {FilterQuery} from 'mongoose';
import {AssigneeService} from '../assignee/assignee.service';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentService} from '../assignment/assignment.service';
import {SolutionAuth} from './solution-auth.decorator';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution} from './solution.schema';
import {SolutionService} from './solution.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

const searchFields = [
  'name',
  'studentId',
  'github',
  'email',
  'assignee',
];

@Controller()
@ApiTags('Solutions')
export class SolutionController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly solutionService: SolutionService,
    private readonly assigneeService: AssigneeService,
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
  @ApiQuery({
    name: 'q',
    description: 'Search query: ' +
      'Terms separated by spaces, ' +
      'with `+` in place of spaces within terms, ' +
      'and `field:term` for searching any of the fields' +
      searchFields.map(s => `\`${s}\``).join(', '),
  })
  async findAll(
    @Param('assignment') assignment: string,
    @Query('q') search?: string,
    @Query('author.github') github?: string,
  ): Promise<ReadSolutionDto[]> {
    const query: FilterQuery<Solution> = {assignment};
    github && (query['author.github'] = github);
    if (search) {
      const terms = search.trim().split(/\s+/);
      query.$and = await Promise.all(terms.map(t => this.toFilter(assignment, t)));
    }
    return this.solutionService.findAll(query);
  }

  private async toFilter(assignment: string, term: string): Promise<FilterQuery<Solution>> {
    term = term.replace(/\+/g, ' ');

    const colonIndex = term.indexOf(':');
    if (colonIndex >= 0) {
      const field = term.substring(0, colonIndex);
      const subTerm = term.substring(colonIndex + 1);
      return this.fieldFilter(assignment, field, subTerm);
    }

    return {
      $or: await Promise.all(searchFields.map(k => this.fieldFilter(assignment, k, term))),
    };
  }

  private async fieldFilter(assignment: string, field: string, term: string): Promise<FilterQuery<Solution>> {
    const regex = new RegExp(term, 'i');
    if (field === 'assignee') {
      return this.assigneeFilter(assignment, regex);
    } else {
      return {['author.' + field]: regex};
    }
  }

  private async assigneeFilter(assignment: string, regex: RegExp): Promise<FilterQuery<Solution>> {
    const assignees = await this.assigneeService.findAll({assignment, assignee: regex});
    return {_id: {$in: assignees.map(a => a.solution)}};
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
