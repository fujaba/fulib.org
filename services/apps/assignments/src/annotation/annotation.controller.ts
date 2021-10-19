import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags} from '@nestjs/swagger';
import {FilterQuery} from 'mongoose';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {SolutionAuth} from '../solution/solution-auth.decorator';
import {CreateAnnotationDto, UpdateAnnotationDto} from './annotation.dto';
import {Annotation} from './annotation.schema';
import {AnnotationService} from './annotation.service';

const forbiddenResponse = 'Not owner of solution or assignment, or invalid Assignment-Token or Solution-Token.';
const forbiddenAssignmentResponse = 'Not owner of assignment, or invalid Assignment-Token.';

@Controller('assignments/:assignment/solutions/:solution/annotations')
@ApiTags('Annotations')
export class AnnotationController {

  constructor(
    private readonly annotationService: AnnotationService,
  ) {
  }

  @Post()
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiCreatedResponse({type: Annotation})
  async create(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Body() dto: CreateAnnotationDto,
  ): Promise<Annotation> {
    return this.annotationService.create(assignment, solution, dto);
  }

  @Get()
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: [Annotation]})
  @ApiQuery({name: 'file', required: false})
  @ApiQuery({name: 'task', required: false})
  async findAll(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Query('file') file?: string,
    @Query('task') task?: string,
  ): Promise<Annotation[]> {
    const where: FilterQuery<Annotation> = {assignment, solution};
    file && (where['snippets.file'] = file);
    task && (where.task = task);
    return this.annotationService.findAll(where);
  }

  @Get(':id')
  @SolutionAuth({forbiddenResponse})
  @ApiOkResponse({type: Annotation})
  @NotFound()
  async findOne(
    @Param('assignment') assignment: string,
    @Param('solution') solution: string,
    @Param('id') id: string,
  ): Promise<Annotation | null> {
    return this.annotationService.findOne(id);
  }

  @Patch(':id')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Annotation})
  @NotFound()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnotationDto,
  ): Promise<Annotation | null> {
    return this.annotationService.update(id, dto);
  }

  @Delete(':id')
  @AssignmentAuth({forbiddenResponse: forbiddenAssignmentResponse})
  @ApiOkResponse({type: Annotation})
  @NotFound()
  async remove(
    @Param('id') id: string,
  ): Promise<Annotation | null> {
    return this.annotationService.remove(id);
  }
}
