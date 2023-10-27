import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {CourseStudent, CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course} from './course.schema';
import {CourseService} from './course.service';
import {CourseAuth} from "./course-auth.decorator";

const forbiddenResponse = 'Not owner.';

@Controller('courses')
@ApiTags('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {
  }

  @Post()
  @Auth()
  @ApiCreatedResponse({type: Course})
  async create(
    @Body() dto: CreateCourseDto,
    @AuthUser() user: UserToken,
  ): Promise<Course> {
    return this.courseService.create(dto, user.sub);
  }

  @Get()
  @ApiOkResponse({type: [Course]})
  async findAll(
    @Query('createdBy') createdBy?: string,
  ): Promise<Course[]> {
    return this.courseService.findAll({createdBy});
  }

  @Get(':id')
  @NotFound()
  @ApiOkResponse({type: Course})
  async findOne(@Param('id') id: string): Promise<Course | null> {
    return this.courseService.findOne(id);
  }

  @Get(':id/students')
  @ApiOperation({summary: 'Get summary of all students in a course'})
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: [CourseStudent]})
  async getStudents(
    @Param('id') id: string,
  ): Promise<CourseStudent[]> {
    return this.courseService.getStudents(id);
  }

  @Patch(':id')
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Course})
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ): Promise<Course | null> {
    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Course})
  async remove(
    @Param('id') id: string,
  ): Promise<Course | null> {
    return this.courseService.remove(id);
  }
}
