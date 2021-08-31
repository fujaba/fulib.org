import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {notFound} from '../utils';
import {CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course} from './course.schema';
import {CourseService} from './course.service';

@Controller('courses')
@ApiTags('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {
  }

  @Post()
  @ApiCreatedResponse({type: Course})
  async create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }

  @Get()
  @ApiOkResponse({type: [Course]})
  async findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({type: Course})
  @ApiNotFoundResponse()
  async findOne(@Param('id') id: string) {
    return await this.courseService.findOne(id) ?? notFound(id);
  }

  @Patch(':id')
  @ApiOkResponse({type: Course})
  @ApiNotFoundResponse()
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return await this.courseService.update(id, dto) ?? notFound(id);
  }

  @Delete(':id')
  @ApiOkResponse({type: Course})
  @ApiNotFoundResponse()
  async remove(@Param('id') id: string) {
    return await this.courseService.remove(id) ?? notFound(id);
  }
}
