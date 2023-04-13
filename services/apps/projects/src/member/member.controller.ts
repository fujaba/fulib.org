import {AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@mean-stream/nestx';
import {Body, ConflictException, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {ApiConflictResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {ProjectAuth} from '../project/project-auth.decorator';
import {ProjectService} from '../project/project.service';
import {MemberAuth} from './member-auth.decorator';
import {UpdateMemberDto} from './member.dto';
import {Member} from './member.schema';
import {MemberService} from './member.service';

const forbiddenResponse = 'Not member of project';
const forbiddenProjectResponse = 'Not owner of project.';
const removeOwnerResponse = 'Owner cannot remove themselves as member.';

@Controller('projects/:project/members')
@ApiTags('Members')
export class MemberController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly memberService: MemberService,
  ) {
  }

  @Get()
  @MemberAuth({forbiddenResponse})
  @ApiOkResponse({type: [Member]})
  async findAll(
    @Param('project') projectId: string,
  ): Promise<Member[]> {
    return this.memberService.findAll({projectId});
  }

  @Get(':user')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  async findOne(
    @Param('project') project: string,
    @Param('user') user: string,
  ): Promise<Member | null> {
    return this.memberService.findOne(project, user);
  }

  @Put(':user')
  @ProjectAuth({forbiddenResponse: forbiddenProjectResponse})
  @ApiOkResponse({type: Member})
  async update(
    @Param('project') project: string,
    @Param('user') user: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member> {
    return this.memberService.update(project, user, dto);
  }

  @Delete(':user')
  @ProjectAuth({forbiddenResponse: forbiddenProjectResponse})
  @NotFound()
  @ApiOkResponse({type: Member})
  @ApiConflictResponse({description: removeOwnerResponse})
  async remove(
    @Param('project') project: string,
    @Param('user') user: string,
    @AuthUser() token: UserToken,
  ): Promise<Member | null> {
    if (token.sub === user) {
      throw new ConflictException(removeOwnerResponse);
    }
    return this.memberService.remove(project, user);
  }
}
