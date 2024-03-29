import {Auth, AuthUser, UserToken} from '@app/keycloak-auth';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
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
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {MemberAuth} from '@app/member/member-auth.decorator';
import {ProjectService} from '../project/project.service';
import {ContainerDto, CreateContainerDto} from './container.dto';
import {ContainerService} from './container.service';
import {ProjectAuth} from "../project/project-auth.decorator";

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
  @ApiOperation({summary: 'Create a container for a temporary project'})
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
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
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
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: UserToken,
  ): Promise<ContainerDto | null> {
    return this.containerService.findOne(id.toString(), user.sub);
  }

  @Delete('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: ContainerDto})
  async remove(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: UserToken,
  ): Promise<ContainerDto | null> {
    return this.containerService.remove(id.toString(), user.sub);
  }

  @Post('projects/:id/zip')
  @ApiOperation({summary: 'Upload a zip file to add files to a project'})
  @ProjectAuth({forbiddenResponse: 'Not owner of project.'})
  @UseInterceptors(FileInterceptor('file'))
  async unzip(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any | null> {
    return this.containerService.unzip(id.toString(), file);
  }
}
