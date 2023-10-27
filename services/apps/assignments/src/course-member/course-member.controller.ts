import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Body, ConflictException, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {ApiConflictResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {CourseAuth} from './course-auth.decorator';
import {Member, MemberService, UpdateMemberDto} from '@app/member';

const forbiddenResponse = 'Not member of course';
const notOwnerResponse = 'Not owner of course';
const removeOwnerResponse = 'Owner cannot remove themselves as member';

@Controller('courses/:course/members')
@ApiTags('Course Members')
export class CourseMemberController {
  constructor(
    private readonly memberService: MemberService,
  ) {
  }

  @Get()
  @CourseAuth({forbiddenResponse})
  @ApiOkResponse({type: [Member]})
  async findAll(
    @Param('course', ObjectIdPipe) course: Types.ObjectId,
  ): Promise<Member[]> {
    return this.memberService.findAll({parent: course});
  }

  @Get(':user')
  @CourseAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  async findOne(
    @Param('course', ObjectIdPipe) course: Types.ObjectId,
    @Param('user') user: string,
  ): Promise<Member | null> {
    return this.memberService.findOne({parent: course, user});
  }

  @Put(':user')
  @CourseAuth({forbiddenResponse: notOwnerResponse})
  @ApiOkResponse({type: Member})
  @NotFound()
  async update(
    @Param('course', ObjectIdPipe) course: Types.ObjectId,
    @Param('user') user: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member | null> {
    return this.memberService.upsert({parent: course, user}, dto);
  }

  @Delete(':user')
  @CourseAuth({forbiddenResponse: notOwnerResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  @ApiConflictResponse({description: removeOwnerResponse})
  async remove(
    @Param('course', ObjectIdPipe) course: Types.ObjectId,
    @Param('user') user: string,
    @AuthUser() token: UserToken,
  ): Promise<Member | null> {
    if (token.sub === user) {
      throw new ConflictException(removeOwnerResponse);
    }
    return this.memberService.deleteOne({parent: course, user});
  }
}
