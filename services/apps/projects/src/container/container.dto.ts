import {ApiProperty, PickType} from '@nestjs/swagger';
import {IsAlphanumeric, IsMongoId, IsUrl} from 'class-validator';
import {Project} from '../project/project.schema';

export class ContainerDto {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty({format: 'url'})
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsMongoId()
  projectId: string;

  @ApiProperty()
  @IsAlphanumeric()
  token: string;
}

export class CreateContainerDto extends PickType(Project, [
  'dockerImage',
] as const) {
  @ApiProperty()
  @IsMongoId()
  projectId: string;
}
