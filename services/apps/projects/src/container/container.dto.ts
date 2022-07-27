import {ApiProperty} from '@nestjs/swagger';
import {IsAlphanumeric, IsMongoId, IsUrl} from 'class-validator';

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
}

export class CreateContainerDto {
  @ApiProperty()
  @IsMongoId()
  id: string;
}
