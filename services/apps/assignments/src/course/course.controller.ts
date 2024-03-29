import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Param, ParseArrayPipe, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import {CourseAssignee, CourseStudent, CreateCourseDto, UpdateCourseDto} from './course.dto';
import {Course} from './course.schema';
import {CourseService} from './course.service';
import {CourseAuth} from "../course-member/course-auth.decorator";
import {FilterQuery, Types} from "mongoose";
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
    return this.courseService.create({...dto, createdBy: user.sub});
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
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Course | null> {
    return this.courseService.find(id);
  }

  @Get(':id/students')
  @ApiOperation({summary: 'Get summary of all students in a course'})
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: [CourseStudent]})
  async getStudents(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: UserToken,
  ): Promise<CourseStudent[]> {
    return this.courseService.getStudents(id, user.sub);
  }

  @Get(':id/assignees')
  @ApiOperation({summary: 'Get summary of all assignees in a course'})
  @ApiParam({name: 'id', type: String, format: 'object-id'})
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: [CourseAssignee]})
  async getAssignees(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: UserToken,
  ): Promise<CourseAssignee[]> {
    return this.courseService.getAssignees(id, user.sub);
  }

  @Patch(':id')
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Course})
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateCourseDto,
  ): Promise<Course | null> {
    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Course})
  async remove(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Course | null> {
    return this.courseService.delete(id);
  }
}
