import {Body, Controller, Headers, Param, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {ReadSolutionDto} from '../solution/solution.dto';
import {ImportAssignmentDto} from './classroom.dto';
import {ClassroomService} from './classroom.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller()
@ApiTags('GitHub Classroom')
export class ClassroomController {
  constructor(
    private classroomService: ClassroomService,
  ) {
  }

  @Post('assignments/import')
  @ApiCreatedResponse({type: ImportAssignmentDto})
  async importAssignment(
    @Body() markdown: string,
  ): Promise<ImportAssignmentDto> {
    return this.classroomService.parseAssignment(markdown);
  }

  @Post('assignments/:assignment/solutions/import')
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: [ReadSolutionDto]})
  async importSolutions(
    @Param('assignment') assignment: string,
    @Headers('Authorization') auth: string,
  ): Promise<ReadSolutionDto[]> {
    return this.classroomService.importSolutions(assignment, auth);
  }

  @Post('assignments/:assignment/solutions/:solution/export')
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse()
  async exportGithubIssue(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Headers('Authorization') auth: string,
  ) {
    return this.classroomService.exportGithubIssue(assignment, solution, auth);
  }
}
