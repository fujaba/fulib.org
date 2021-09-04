import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentService} from '../assignment/assignment.service';
import {notFound} from '@app/not-found';
import {SolutionAuth} from './solution-auth.decorator';
import {CreateSolutionDto, ReadSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution} from './solution.schema';
import {SolutionService} from './solution.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

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
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [ReadSolutionDto]})
  async findAll(
    @Param('assignment') assignment: string,
  ): Promise<ReadSolutionDto[]> {
    return this.solutionService.findAll({assignment});
  }

  @Get(':id')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({
    description: 'The token property is omitted.',
    type: ReadSolutionDto,
  })
  @ApiNotFoundResponse()
  async findOne(
    @Param('id') id: string,
  ): Promise<ReadSolutionDto> {
    const solution = await this.solutionService.findOne(id) ?? notFound(id);
    return this.solutionService.mask(solution.toObject());
  }

  @Patch(':id')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: ReadSolutionDto})
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSolutionDto,
  ): Promise<ReadSolutionDto> {
    const solution = await this.solutionService.update(id, dto) ?? notFound(id);
    return this.solutionService.mask(solution);
  }

  @Delete(':id')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: ReadSolutionDto})
  @ApiNotFoundResponse()
  async remove(
    @Param('id') id: string,
  ): Promise<ReadSolutionDto> {
    const solution = await this.solutionService.remove(id) ?? notFound(id);
    return this.solutionService.mask(solution.toObject());
  }
}
