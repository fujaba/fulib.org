import {NotFound} from '@app/not-found';
import {Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {Container} from '../../../../../frontend/src/app/projects/model/container';
import {ProjectAuth} from '../project/project-auth.decorator';
import {ContainerService} from './container.service';

const forbiddenResponse = 'Not owner of project.';

@Controller('projects/:id/container')
@ApiTags('Containers')
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {
  }

  @Post()
  @ProjectAuth({forbiddenResponse})
  @ApiCreatedResponse({type: Container})
  async create(@Param('id') id: string): Promise<Container> {
    return this.containerService.create(id);
  }

  @Get()
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Container})
  async findOne(@Param('id') id: string): Promise<Container | null> {
    return this.containerService.findOne(id);
  }

  @Delete()
  @ProjectAuth({forbiddenResponse})
  @NotFound()
  @ApiOkResponse({type: Container})
  async remove(@Param('id') id: string): Promise<Container | null> {
    return this.containerService.remove(id);
  }
}
