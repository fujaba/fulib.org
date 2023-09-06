import {Controller, Get, Param, ParseArrayPipe, Post, Query, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {ClassroomService} from './classroom.service';
import {ImportSolution} from "./classroom.dto";
import {AssignmentService} from "../assignment/assignment.service";
import {notFound} from "@mean-stream/nestx";

const forbiddenResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller()
@ApiTags('GitHub Classroom')
export class ClassroomController {
  constructor(
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
  ) {
  }

  @Get('assignments/:assignment/solutions/import')
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: [ImportSolution]})
  async previewImport(
    @Param('assignment') id: string,
  ): Promise<ImportSolution[]> {
    const assignment = await this.assignmentService.findOne(id) || notFound(id);
    return this.classroomService.previewImports(assignment);
  }

  @Post('assignments/:assignment/solutions/import')
  @UseInterceptors(FilesInterceptor('files'))
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: [ImportSolution]})
  async importSolutions(
    @Param('assignment') id: string,
    @Query('usernames', new ParseArrayPipe({optional: true})) usernames?: string[],
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ImportSolution[]> {
    const assignment = await this.assignmentService.findOne(id) || notFound(id);
    return files ? this.classroomService.importFiles(assignment, files) : this.classroomService.importSolutions(assignment, usernames);
  }
}
