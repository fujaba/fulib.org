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
import {Member, MemberAuth, MemberService, UpdateMemberDto} from '@app/member';

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
    await this.memberService.model.syncIndexes();
    const {modifiedCount} = await this.memberService.updateMany({
      projectId: {$exists: true},
      userId: {$exists: true},
    }, [
      {$set: {parent: '$projectId', user: '$userId'}},
      {$unset: ['projectId', 'userId']},
    ]);
    modifiedCount && this.logger.warn(`Migrated ${modifiedCount} members`);
  }

  @Get()
  @MemberAuth({forbiddenResponse})
  @ApiOkResponse({type: [Member]})
  async findAll(
    @Param('project', ObjectIdPipe) project: Types.ObjectId,
  ): Promise<Member[]> {
    return this.memberService.findAll({parent: project});
  }

  @Get(':user')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  async findOne(
    @Param('project', ObjectIdPipe) project: Types.ObjectId,
    @Param('user') user: string,
  ): Promise<Member | null> {
    return this.memberService.findOne({parent: project, user});
  }

  @Put(':user')
  @ProjectAuth({forbiddenResponse: forbiddenProjectResponse})
  @ApiOkResponse({type: Member})
  @NotFound()
  async update(
    @Param('project', ObjectIdPipe) project: Types.ObjectId,
    @Param('user') user: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member | null> {
    return this.memberService.updateOne({parent: project, user}, dto);
  }

  @Delete(':user')
  @ProjectAuth({forbiddenResponse: forbiddenProjectResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  @ApiConflictResponse({description: removeOwnerResponse})
  async remove(
    @Param('project', ObjectIdPipe) project: Types.ObjectId,
    @Param('user') user: string,
    @AuthUser() token: UserToken,
  ): Promise<Member | null> {
    if (token.sub === user) {
      throw new ConflictException(removeOwnerResponse);
    }
    return this.memberService.deleteOne({parent: project, user});
  }
}
