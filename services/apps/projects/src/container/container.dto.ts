import {ApiProperty, PickType} from '@nestjs/swagger';
import {IsAlphanumeric, IsBoolean, IsMongoId, IsUrl} from 'class-validator';
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

  @ApiProperty({format: 'url'})
  @IsUrl()
  vncUrl: string;

  @ApiProperty()
  @IsBoolean()
  isNew: boolean;
}

export class CreateContainerDto extends PickType(Project, [
  'dockerImage',
  'repository',
] as const) {
  @ApiProperty()
  @IsMongoId()
  projectId: string;
}
