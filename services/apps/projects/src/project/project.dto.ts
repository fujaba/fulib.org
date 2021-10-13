import {OmitType, PartialType} from '@nestjs/swagger';
import {Project} from './project.schema';

export class CreateProjectDto extends OmitType(Project, [
  'userId',
  'created',
] as const) {
}

export class UpdateProjectDto extends PartialType(OmitType(Project, [
  'created',
] as const)) {
}
