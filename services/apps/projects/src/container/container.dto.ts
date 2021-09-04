import {ApiProperty} from '@nestjs/swagger';
import {IsMongoId, IsUrl} from 'class-validator';

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
}

export class CreateContainerDto {
  @ApiProperty()
  @IsMongoId()
  id: string;
}
