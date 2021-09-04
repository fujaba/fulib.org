import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Param, ParseIntPipe, Put} from '@nestjs/common';
import {ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {AssignmentService} from '../assignment/assignment.service';
import {SolutionAuth} from '../solution/solution-auth.decorator';
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
  @NotFound()
  @ApiOkResponse({type: Grading})
  async findOne(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('task', ParseIntPipe) task: number,
  ): Promise<Grading | null> {
    return this.gradingService.findOne({
      assignment,
      solution,
      task,
    });
  }

  @Put(':task')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @NotFound()
  @ApiOkResponse({type: Grading})
  async update(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('task', ParseIntPipe) task: number,
    @Body() dto: UpdateGradingDto,
    @AuthUser() user?: UserToken,
  ): Promise<Grading | null> {
    return this.gradingService.update({
      assignment,
      solution,
      task,
    }, dto, user?.sub);
  }

  @Delete(':task')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @NotFound()
  @ApiOkResponse({type: Grading})
  async remove(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('task', ParseIntPipe) task: number,
  ): Promise<Grading | null> {
    return this.gradingService.remove({
      assignment,
      solution,
      task,
    });
  }
}
