import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {notFound} from '../utils';
import {CreateCourseDto, UpdateCourseDto} from './course.dto';
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
  ) {
    return this.courseService.create(dto, user?.sub);
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
  @Auth()
  @ApiOkResponse({type: Course})
  @ApiNotFoundResponse()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @AuthUser() user: UserToken,
  ) {
    await this.checkAuth(id, user);
    return await this.courseService.update(id, dto) ?? notFound(id);
  }

  @Delete(':id')
  @Auth()
  @ApiOkResponse({type: Course})
  @ApiNotFoundResponse()
  async remove(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @AuthUser() user: UserToken,
  ) {
    await this.checkAuth(id, user);
    return await this.courseService.remove(id) ?? notFound(id);
  }

  private async checkAuth(id: string, user: UserToken) {
    const course = await this.courseService.findOne(id);
    if (!course) {
      notFound(id);
    }

    if (course.creator !== user.sub) {
      throw new ForbiddenException(forbiddenResponse);
    }
  }
}
