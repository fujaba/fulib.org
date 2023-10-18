import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {MemberAuth, MemberService} from '@app/member';
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
    return this.projectService.create(dto, user.sub);
  }

  @Get()
  @Auth()
  @ApiOkResponse({type: [Project]})
  async findAll(
    @AuthUser() user: UserToken,
  ): Promise<Project[]> {
    const members = await this.memberService.findAll({user: user.sub});
    return this.projectService.findAll({_id: {$in: members.map(m => m.parent)}});
  }

  @Get(':id')
  @MemberAuth({forbiddenResponse: forbiddenMemberResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Project | null> {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project | null> {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async remove(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Project | null> {
    return this.projectService.remove(id);
  }
}
