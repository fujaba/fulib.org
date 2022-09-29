import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, NotFoundException, Param, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {MemberAuth} from '../member/member-auth.decorator';
import {ProjectService} from '../project/project.service';
import {ContainerDto, CreateContainerDto} from './container.dto';
import {ContainerService} from './container.service';
import {FileInterceptor} from '@nestjs/platform-express';

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
  async createTemp(@Body() dto: CreateContainerDto): Promise<ContainerDto> {
    return this.containerService.create(dto.projectId, dto.dockerImage);
  }

  @Post('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @ApiCreatedResponse({type: ContainerDto})
  @ApiNotFoundResponse({description: 'Project not found'})
  async create(@Param('id') id: string): Promise<ContainerDto> {
    const project = await this.projectService.findOne(id);
    if (!project) {
      throw new NotFoundException(id);
    }
    return this.containerService.create(id, project.dockerImage);
  }

  @Get('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: ContainerDto})
  async findOne(@Param('id') id: string): Promise<ContainerDto | null> {
    return this.containerService.findOne(id);
  }

  @Delete('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: ContainerDto})
  async remove(@Param('id') id: string): Promise<ContainerDto | null> {
    return this.containerService.remove(id);
  }

  @Post('projects/zip/:id')
  @UseInterceptors(FileInterceptor('file'))
  async unzip(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<any | null> {
    return this.containerService.unzip(id, file);
  }
}
