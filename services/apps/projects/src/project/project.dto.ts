import {OmitType, PartialType} from '@nestjs/swagger';
import {Project} from './project.schema';

export class CreateProjectDto extends OmitType(Project, [
  '_id',
  'userId',
  'created',
] as const) {
}

export class UpdateProjectDto extends PartialType(OmitType(Project, [
  'created',
] as const)) {
}
