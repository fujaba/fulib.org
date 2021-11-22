import {Controller, Headers, Param, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {ReadSolutionDto} from '../solution/solution.dto';
import {ClassroomService} from './classroom.service';

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller()
@ApiTags('GitHub Classroom')
export class ClassroomController {
  constructor(
    private classroomService: ClassroomService,
  ) {
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
}
