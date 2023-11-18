import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdArrayPipe, ObjectIdPipe} from '@mean-stream/nestx';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import {ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {isMongoId} from 'class-validator';
import {FilterQuery, Types} from 'mongoose';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {SolutionAuth} from './solution-auth.decorator';
import {BatchUpdateSolutionDto, CreateSolutionDto, RichSolutionDto, UpdateSolutionDto} from './solution.dto';
import {Solution, SOLUTION_COLLATION, SOLUTION_SORT} from './solution.schema';
import {SolutionService} from './solution.service';
import {FilesInterceptor} from "@nestjs/platform-express";
import {FileService} from "../file/file.service";
import {generateToken} from "../utils";

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller()
@ApiTags('Solutions')
export class SolutionController {
  constructor(
    private readonly solutionService: SolutionService,
    private readonly fileService: FileService,
  ) {
  }

  @Post('assignments/:assignment/solutions')
  @Auth({optional: true})
  @ApiCreatedResponse({type: Solution})
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Body() dto: CreateSolutionDto,
    @AuthUser() user?: UserToken,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<Solution> {
    const solution = await this.solutionService.create({
      ...dto,
      assignment,
      createdBy: user?.sub,
      token: generateToken(),
      timestamp: new Date(),
    });
    if (files && files.length) {
      await this.fileService.importFiles(assignment.toString(), solution.id, files);
    }
    return solution;
  }

  @Get('assignments/:assignment/solutions')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [Solution]})
  @ApiQuery({
    name: 'q',
    description: 'Search query: ' +
      'Terms separated by spaces, ' +
      'with `+` in place of spaces within terms, ' +
      'and `field:term` for searching any of the author fields and `assignee`, `origin`, or `status`.'
  })
  async findAll(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Query('ids', new DefaultValuePipe([]), ParseArrayPipe, ObjectIdArrayPipe) ids: Types.ObjectId[],
    @Query('q') search?: string,
  ): Promise<RichSolutionDto[]> {
    const preFilter: FilterQuery<Solution>[] = [];
    const postFilter: FilterQuery<RichSolutionDto>[] = [];
    preFilter.push({assignment});
    if (ids.length) {
      preFilter.push({_id: {$in: ids}});
    }
    if (search) {
      const terms = search.trim().split(/\s+/);
      for (const term of terms) {
        this.toFilter(term, preFilter, postFilter);
      }
    }
    return this.solutionService.findRich({$and: preFilter}, postFilter.length ? {$and: postFilter} : {});
  }

  private toFilter(term: string, preAnd: FilterQuery<Solution>[], postAnd: FilterQuery<RichSolutionDto>[]) {
    term = term.replace(/\+/g, ' ');

    const colonIndex = term.indexOf(':');
    if (colonIndex < 0) {
      const regex = new RegExp(term, 'i');
      postAnd.push({
        $or: [
          {assignee: regex},
          {'author.name': regex},
          {'author.github': regex},
          {'author.email': regex},
          {'author.studentId': regex},
        ],
      });
    } else {
      const field = term.substring(0, colonIndex).toLowerCase();
      const subTerm = term.substring(colonIndex + 1);
      const regex = new RegExp(subTerm, 'i');
      switch (field) {
        case 'assignee':
          postAnd.push({assignee: regex});
          break;
        case 'origin':
          if (isMongoId(subTerm)) {
            const origin = new Types.ObjectId(subTerm);
            postAnd.push({$or: [
              {'_evaluations.codeSearch.origin': origin},
              {'_evaluations.similarity.origin': origin},
            ]});
          }
          break;
        case 'status':
          postAnd.push({status: subTerm});
          break;
        case 'name':
        case 'github':
        case 'email':
        case 'studentid':
          preAnd.push({[`author.${field}`]: regex});
          break;
      }
    }
  }

  @Get('assignments/:assignment/solutions/:id')
  @SolutionAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Solution})
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Solution | null> {
    return this.solutionService.find(id);
  }

  @Get('solutions')
  @ApiOperation({summary: 'List your own solutions'})
  @Auth()
  @ApiOkResponse({type: [Solution]})
  async findOwn(
    @AuthUser() user: UserToken,
  ): Promise<Solution[]> {
    return this.solutionService.findAll({createdBy: user.sub}, {
      sort: SOLUTION_SORT,
      collation: SOLUTION_COLLATION,
    });
  }

  @Patch('assignments/:assignment/solutions/:id')
  @SolutionAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Solution})
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateSolutionDto,
  ): Promise<Solution | null> {
    return this.solutionService.update(id, dto);
  }

  @Patch('assignments/:assignment/solutions')
  @ApiOperation({
    summary: 'Batch update multiple solutions',
    description: 'Matches by _id or any author field. ' +
      'Only the fields that are present in the request body will be updated.',
  })
  @ApiBody({type: [UpdateSolutionDto]})
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiBody({type: [BatchUpdateSolutionDto]})
  @ApiOkResponse({type: [Solution]})
  async updateMany(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Body(new ParseArrayPipe({items: BatchUpdateSolutionDto})) dtos: BatchUpdateSolutionDto[],
  ): Promise<(Solution | null)[]> {
    return this.solutionService.batchUpdate(assignment, dtos);
  }

  @Delete('assignments/:assignment/solutions/:id')
  @SolutionAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Solution})
  async remove(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Solution | null> {
    return this.solutionService.delete(id);
  }

  @Delete('assignments/:assignment/solutions')
  @ApiOperation({summary: 'Batch delete multiple solutions by IDs'})
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: [Solution]})
  async removeAll(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Query('ids', ParseArrayPipe, ObjectIdArrayPipe) ids: Types.ObjectId[],
  ): Promise<Solution[]> {
    const solutions = await this.solutionService.findAll({
      assignment,
      _id: {$in: ids},
    });
    await this.solutionService.deleteAll(solutions);
    return solutions;
  }
}
