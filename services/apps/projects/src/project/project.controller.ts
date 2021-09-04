import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {ProjectAuth} from './project-auth.decorator';
import {CreateProjectDto, UpdateProjectDto} from './project.dto';
import {Project} from './project.schema';
import {ProjectService} from './project.service';

const forbiddenResponse = 'Not owner.';

@Controller('projects')
@ApiTags('Projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
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
    return this.projectService.findAll({userId: user.sub});
  }

  @Get(':id')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async findOne(
    @Param('id') id: string,
    @AuthUser() user: UserToken,
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
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Project})
  async remove(
    @Param('id') id: string,
  ): Promise<Project | null> {
    return this.projectService.remove(id);
  }
}
