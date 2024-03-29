import {
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {ClassroomService} from './classroom.service';
import {ImportSolution} from "./classroom.dto";
import {AssignmentService} from "../assignment/assignment.service";
import {notFound, ObjectIdPipe} from "@mean-stream/nestx";
import {Types} from "mongoose";

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
  @ApiOperation({summary: 'Preview import of solutions from GitHub'})
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: [ImportSolution]})
  async previewImport(
    @Param('assignment', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<ImportSolution[]> {
    const assignment = await this.assignmentService.find(id) || notFound(id);
    return this.classroomService.previewImports(assignment);
  }

  @Post('assignments/:assignment/solutions/import')
  @ApiOperation({summary: 'Import solutions from GitHub'})
  @UseInterceptors(FilesInterceptor('files'))
  @AssignmentAuth({forbiddenResponse})
  @ApiCreatedResponse({type: [ImportSolution]})
  async importSolutions(
    @Param('assignment', ObjectIdPipe) id: Types.ObjectId,
    @Query('usernames', new ParseArrayPipe({optional: true})) usernames?: string[],
    @Query('reimport', new ParseBoolPipe({optional: true})) reimport?: boolean,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ImportSolution[]> {
    const assignment = await this.assignmentService.find(id) || notFound(id);
    return files ? this.classroomService.importFiles(assignment, files) : this.classroomService.importSolutions(assignment, usernames, reimport);
  }
}
