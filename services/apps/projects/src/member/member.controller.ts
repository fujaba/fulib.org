import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Optional,
  Param,
  Put
} from '@nestjs/common';
import {ApiConflictResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {ProjectAuth} from '../project/project-auth.decorator';
import {MemberAuth} from '@app/member/member-auth.decorator';
import {UpdateMemberDto} from '@app/member/member.dto';
import {Member} from '@app/member/member.schema';
import {MemberService} from '@app/member/member.service';

const forbiddenResponse = 'Not member of project';
const forbiddenProjectResponse = 'Not owner of project.';
const removeOwnerResponse = 'Owner cannot remove themselves as member.';

@Controller('projects/:project/members')
@ApiTags('Members')
export class MemberController implements OnModuleInit {
  constructor(
    @Optional() @Inject() private readonly logger = new Logger(MemberService.name),
    private readonly memberService: MemberService,
  ) {
  }

  async onModuleInit() {
    const {modifiedCount} = await this.memberService.updateMany({
      projectId: {$type: 'string'},
    }, [{
      $set: {projectId: {$toObjectId: '$projectId'}},
    }]);
    modifiedCount && this.logger.warn(`Migrated ${modifiedCount} members`);
  }

  @Get()
  @MemberAuth({forbiddenResponse})
  @ApiOkResponse({type: [Member]})
  async findAll(
    @Param('project', ObjectIdPipe) projectId: Types.ObjectId,
  ): Promise<Member[]> {
    return this.memberService.findAll({projectId});
  }

  @Get(':user')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  async findOne(
    @Param('project', ObjectIdPipe) projectId: Types.ObjectId,
    @Param('user') userId: string,
  ): Promise<Member | null> {
    return this.memberService.findOne({projectId, userId});
  }

  @Put(':user')
  @ProjectAuth({forbiddenResponse: forbiddenProjectResponse})
  @ApiOkResponse({type: Member})
  async update(
    @Param('project', ObjectIdPipe) projectId: Types.ObjectId,
    @Param('user') userId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member> {
    return this.memberService.update({projectId, userId}, dto);
  }

  @Delete(':user')
  @ProjectAuth({forbiddenResponse: forbiddenProjectResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  @ApiConflictResponse({description: removeOwnerResponse})
  async remove(
    @Param('project', ObjectIdPipe) projectId: Types.ObjectId,
    @Param('user') userId: string,
    @AuthUser() token: UserToken,
  ): Promise<Member | null> {
    if (token.sub === userId) {
      throw new ConflictException(removeOwnerResponse);
    }
    return this.memberService.deleteOne({projectId, userId});
  }
}
