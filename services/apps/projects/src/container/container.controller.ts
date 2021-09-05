import {NotFound} from '@app/not-found';
import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {MemberAuth} from '../member/member-auth.decorator';
import {ContainerDto, CreateContainerDto} from './container.dto';
import {ContainerService} from './container.service';

const forbiddenResponse = 'Not member of project.';

@Controller()
@ApiTags('Containers')
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {
  }

  @Post('container')
  @ApiCreatedResponse({type: ContainerDto})
  async createTemp(@Body() dto: CreateContainerDto): Promise<ContainerDto> {
    return this.containerService.create(dto.id);
  }

  @Post('projects/:id/container')
  @MemberAuth({forbiddenResponse})
  @ApiCreatedResponse({type: ContainerDto})
  async create(@Param('id') id: string): Promise<ContainerDto> {
    return this.containerService.create(id);
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
}
