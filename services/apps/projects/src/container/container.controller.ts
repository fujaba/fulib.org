import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound} from '@app/not-found';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {MemberAuth} from '../member/member-auth.decorator';
import {ProjectService} from '../project/project.service';
import {ContainerDto, CreateContainerDto} from './container.dto';
import {ContainerService} from './container.service';

const forbiddenResponse = 'Not member of project.';

@Controller()
@ApiTags('Containers')
export class ContainerController {
  constructor(
    private readonly containerService: ContainerService,
    private readonly projectService: ProjectService,
  ) {
  }

  @Post('container')
  @ApiCreatedResponse({type: ContainerDto})
  @Auth({optional: true})
  async createTemp(
    @Body() dto: CreateContainerDto,
    @Headers('Authorization') authorization?: string,
    @AuthUser() user?: UserToken,
  ): Promise<ContainerDto> {
    return this.containerService.start(dto, user, authorization);
  }

  @Post('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @ApiCreatedResponse({type: ContainerDto})
  @ApiNotFoundResponse({description: 'Project not found'})
  async create(
    @Param('id') id: string,
    @Headers('Authorization') authorization: string,
    @AuthUser() user: UserToken,
  ): Promise<ContainerDto> {
    const project = await this.projectService.findOne(id);
    if (!project) {
      throw new NotFoundException(id);
    }
    return this.containerService.create(project, user, authorization);
  }

  @Get('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: ContainerDto})
  async findOne(
    @Param('id') id: string,
    @AuthUser() user: UserToken,
  ): Promise<ContainerDto | null> {
    return this.containerService.findOne(id, user.sub);
  }

  @Delete('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: ContainerDto})
  async remove(
    @Param('id') id: string,
    @AuthUser() user: UserToken,
  ): Promise<ContainerDto | null> {
    return this.containerService.remove(id, user.sub);
  }

  @Post('projects/:id/zip')
  @UseInterceptors(FileInterceptor('file'))
  async unzip(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<any | null> {
    return this.containerService.unzip(id, file);
  }
}
