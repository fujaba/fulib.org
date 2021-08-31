import {Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put} from '@nestjs/common';
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {notFound} from '../utils';
import {CreateAssignmentDto, UpdateAssignmentDto} from './assignment.dto';
import {Assignment} from './assignment.schema';
import {AssignmentService} from './assignment.service';

@Controller('assignments')
@ApiTags('Assignments')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
  ) {
  }

  @Post()
  @ApiCreatedResponse({ type: Assignment })
  async create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentService.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [Assignment] })
  async findAll() {
    return this.assignmentService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Assignment })
  @ApiNotFoundResponse()
  async findOne(@Param('id') id: string) {
    return await this.assignmentService.findOne(id) ?? notFound(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Assignment })
  @ApiNotFoundResponse()
  async update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return await this.assignmentService.update(id, dto) ?? notFound(id);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Assignment })
  @ApiNotFoundResponse()
  async remove(@Param('id') id: string) {
    return await this.assignmentService.remove(id) ?? notFound(id);
  }
}
