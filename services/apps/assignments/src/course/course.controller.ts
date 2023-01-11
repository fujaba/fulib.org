import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, notFound} from '@clashsoft/nestx';
import {Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {CourseStudent, CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course} from './course.schema';
import {CourseService} from './course.service';

const forbiddenResponse = 'Not owner.';

@Controller('courses')
@ApiTags('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {
  }

  @Post()
  @Auth({optional: true})
  @ApiCreatedResponse({type: Course})
  async create(
    @Body() dto: CreateCourseDto,
    @AuthUser() user?: UserToken,
  ): Promise<Course> {
    return this.courseService.create(dto, user?.sub);
  }

  @Get()
  @ApiOkResponse({type: [Course]})
  async findAll(): Promise<Course[]> {
    return this.courseService.findAll();
  }

  @Get(':id')
  @NotFound()
  @ApiOkResponse({type: Course})
  async findOne(@Param('id') id: string): Promise<Course | null> {
    return this.courseService.findOne(id);
  }

  @Get(':id/students')
  @Auth()
  @NotFound()
  @ApiOkResponse({type: [CourseStudent]})
  @ApiForbiddenResponse({description: forbiddenResponse})
  async getStudents(
    @Param('id') id: string,
    @AuthUser() user: UserToken,
  ): Promise<CourseStudent[]> {
    await this.checkAuth(id, user);
    return this.courseService.getStudents(id);
  }

  @Patch(':id')
  @Auth()
  @NotFound()
  @ApiOkResponse({type: Course})
  @ApiForbiddenResponse({description: forbiddenResponse})
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @AuthUser() user: UserToken,
  ): Promise<Course | null> {
    await this.checkAuth(id, user);
    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @NotFound()
  @ApiOkResponse({type: Course})
  @ApiForbiddenResponse({description: forbiddenResponse})
  async remove(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @AuthUser() user: UserToken,
  ): Promise<Course | null> {
    await this.checkAuth(id, user);
    return this.courseService.remove(id);
  }

  private async checkAuth(id: string, user: UserToken) {
    const course = await this.courseService.findOne(id) ?? notFound(id);
    if (course.createdBy !== user.sub) {
      throw new ForbiddenException(forbiddenResponse);
    }
  }
}
