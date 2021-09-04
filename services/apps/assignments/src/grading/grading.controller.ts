import {AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, Get, Param, ParseIntPipe, Put} from '@nestjs/common';
import {ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentService} from '../assignment/assignment.service';
import {SolutionAuth} from '../solution/solution-auth.decorator';
import {notFound} from '@app/not-found';
import {UpdateGradingDto} from './grading.dto';
import {Grading} from './grading.schema';
import {GradingService} from './grading.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller('assignments/:assignment/solutions/:solution/gradings')
@ApiTags('Gradings')
export class GradingController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly gradingService: GradingService,
  ) {
  }

  @Get()
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: [Grading]})
  async findAll(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
  ): Promise<Grading[]> {
    return this.gradingService.findAll({assignment, solution});
  }

  @Get(':task')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: Grading})
  @ApiNotFoundResponse()
  async findOne(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('task', ParseIntPipe) task: number,
  ): Promise<Grading> {
    return await this.gradingService.findOne({
      assignment,
      solution,
      task,
    }) ?? notFound(`${assignment} ${solution} ${task}`);
  }

  @Put(':task')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Grading})
  @ApiNotFoundResponse()
  async update(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('task', ParseIntPipe) task: number,
    @Body() dto: UpdateGradingDto,
    @AuthUser() user?: UserToken,
  ): Promise<Grading> {
    return await this.gradingService.update({
      assignment,
      solution,
      task,
    }, dto, user?.sub) ?? notFound(`${assignment} ${solution} ${task}`);
  }

  @Delete(':task')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Grading})
  @ApiNotFoundResponse()
  async remove(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('task', ParseIntPipe) task: number,
  ): Promise<Grading> {
    return await this.gradingService.remove({
      assignment,
      solution,
      task,
    }) ?? notFound(`${assignment} ${solution} ${task}`);
  }
}
