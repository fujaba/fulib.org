import {Controller, Param, Post, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('files'))
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: [ReadSolutionDto]})
  async importSolutions(
    @Param('assignment') assignment: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ReadSolutionDto[]> {
    return files ? this.classroomService.importFiles(assignment, files) : this.classroomService.importSolutions(assignment);
  }
}
