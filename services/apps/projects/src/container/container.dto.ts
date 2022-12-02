import {ApiProperty, PickType} from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches, Max,
} from 'class-validator';
import {environment} from '../environment';
import {Project} from '../project/project.schema';

export class ContainerDto {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty({format: 'url'})
  @IsUrl()
  url: string;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  projectId?: string;

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

export const allowedFilenameCharacters = 'a-zA-Z0-9_.-';

export class CreateContainerDto extends PickType(Project, [
  'dockerImage',
  'repository',
] as const) {
  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @ApiProperty({description: 'Idle timeout in milliseconds', maximum: environment.docker.heartbeatTimeout})
  @IsOptional()
  @IsNumber()
  @Max(environment.docker.heartbeatTimeout)
  idleTimeout?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(new RegExp(`^[${allowedFilenameCharacters}]+$`))
  folderName?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  machineSettings?: object;

  @ApiProperty()
  @IsOptional()
  @IsString({each: true})
  extensions?: string[];
}
