import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Body, ConflictException, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {ApiConflictResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {AssignmentAuth} from '../assignment/assignment-auth.decorator';
import {Member, MemberService, UpdateMemberDto} from '@app/member';

const forbiddenResponse = 'Not member of assignment';
const notOwnerResponse = 'Not owner of assignment';
const removeOwnerResponse = 'Owner cannot remove themselves as member';

@Controller('assignments/:assignment/members')
@ApiTags('Assignment Members')
export class AssignmentMemberController {
  constructor(
    private readonly memberService: MemberService,
  ) {
  }

  @Get()
  @AssignmentAuth({forbiddenResponse})
  @ApiOkResponse({type: [Member]})
  async findAll(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
  ): Promise<Member[]> {
    return this.memberService.findAll({parent: assignment});
  }

  @Get(':user')
  @AssignmentAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  async findOne(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('user') user: string,
  ): Promise<Member | null> {
    return this.memberService.findOne({parent: assignment, user});
  }

  @Put(':user')
  @AssignmentAuth({forbiddenResponse: notOwnerResponse})
  @ApiOkResponse({type: Member})
  @NotFound()
  async update(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('user') user: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member | null> {
    return this.memberService.upsert({parent: assignment, user}, dto);
  }

  @Delete(':user')
  @AssignmentAuth({forbiddenResponse: notOwnerResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  @ApiConflictResponse({description: removeOwnerResponse})
  async remove(
    @Param('assignment', ObjectIdPipe) assignment: Types.ObjectId,
    @Param('user') user: string,
    @AuthUser() token: UserToken,
  ): Promise<Member | null> {
    if (token.sub === user) {
      throw new ConflictException(removeOwnerResponse);
    }
    return this.memberService.deleteOne({parent: assignment, user});
  }
}
