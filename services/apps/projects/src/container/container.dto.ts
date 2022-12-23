import {ApiProperty, PickType} from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsBoolean,
  IsHexadecimal,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
} from 'class-validator';
import {environment} from '../environment';
import {Project} from '../project/project.schema';

export class ContainerDto {
  @ApiProperty()
  @IsHexadecimal()
  id: string;

  @ApiProperty()
  @IsHexadecimal()
  name: string;

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

  @ApiProperty({description: 'Idle timeout in seconds', minimum: 0, maximum: environment.docker.heartbeatTimeout})
  @IsOptional()
  @IsNumber()
  @Min(0)
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
