import {NotFound} from '@app/not-found';
import {Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {ProjectAuth} from '../project/project-auth.decorator';
import {ContainerDto} from './container.dto';
import {ContainerService} from './container.service';

const forbiddenResponse = 'Not owner of project.';

@Controller()
@ApiTags('Containers')
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {
  }

  @Post('projects/:id/container')
  @ProjectAuth({forbiddenResponse})
  @ApiCreatedResponse({type: ContainerDto})
  async create(@Param('id') id: string): Promise<ContainerDto> {
    return this.containerService.create(id);
  }

  @Get('projects/:id/container')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: ContainerDto})
  async findOne(@Param('id') id: string): Promise<ContainerDto | null> {
    return this.containerService.findOne(id);
  }

  @Delete('projects/:id/container')
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: ContainerDto})
  async remove(@Param('id') id: string): Promise<ContainerDto | null> {
    return this.containerService.remove(id);
  }
}
