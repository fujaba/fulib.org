import {OmitType, PartialType} from '@nestjs/swagger';
import {Assignee} from './assignee.schema';

export class UpdateAssigneeDto extends OmitType(Assignee, [
  'solution',
  'assignment',
] as const) {
}

export class PatchAssigneeDto extends PartialType(UpdateAssigneeDto) {
}

export class BulkUpdateAssigneeDto extends OmitType(Assignee, [
  'assignment',
] as const) {
}
