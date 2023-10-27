import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Param, ParseArrayPipe, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {CourseStudent, CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course} from './course.schema';
import {CourseService} from './course.service';
import {CourseAuth} from "../course-member/course-auth.decorator";
import {FilterQuery} from "mongoose";
import {MemberService} from "@app/member";

const forbiddenResponse = 'Not owner.';

@Controller('courses')
@ApiTags('Courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly memberService: MemberService,
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
    @Query('members', new ParseArrayPipe({optional: true})) memberIds?: string[],
  ): Promise<Course[]> {
    const filter: FilterQuery<Course> = {};
    if (createdBy) {
      (filter.$or ||= []).push({createdBy});
    }
    if (memberIds) {
      const members = await this.memberService.findAll({user: {$in: memberIds}});
      (filter.$or ||= []).push({_id: {$in: members.map(m => m.parent)}});
    }
    return this.courseService.findAll(filter);
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
