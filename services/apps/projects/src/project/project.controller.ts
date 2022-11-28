import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {MemberAuth} from '../member/member-auth.decorator';
import {MemberService} from '../member/member.service';
import {ProjectAuth} from './project-auth.decorator';
import {CreateProjectDto, UpdateProjectDto} from './project.dto';
import {Project} from './project.schema';
import {ProjectService} from './project.service';

const forbiddenResponse = 'Not owner.';
const forbiddenMemberResponse = 'Not member.';

@Controller('projects')
@ApiTags('Projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly memberService: MemberService,
  ) {
  }

  @Post()
  @Auth()
  @ApiCreatedResponse({type: Project})
  async create(
    @Body() dto: CreateProjectDto,
    @AuthUser() user: UserToken,
  ): Promise<Project> {
    const project = await this.projectService.create(dto, user.sub);
    project && await this.memberService.update(project.id, user.sub, {});
    return project;
  }

  @Get()
  @Auth()
  @ApiOkResponse({type: [Project]})
  async findAll(
    @AuthUser() user: UserToken,
  ): Promise<Project[]> {
    const members = await this.memberService.findAll({userId: user.sub});
    return this.projectService.findAll({_id: {$in: members.map(m => m.projectId)}});
  }

  @Get(':id')
  @MemberAuth({forbiddenResponse: forbiddenMemberResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async findOne(
    @Param('id') id: string,
  ): Promise<Project | null> {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project | null> {
    const project = await this.projectService.update(id, dto);
    if (project && dto.userId) {
      // when changing owner, create a member
      await this.memberService.update(id, dto.userId, {});
    }
    return project;
  }

  @Delete(':id')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async remove(
    @Param('id') id: string,
  ): Promise<Project | null> {
    await this.memberService.removeAll({projectId: id});
    return this.projectService.remove(id);
  }
}
