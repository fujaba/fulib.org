import {OmitType} from '@nestjs/swagger';
import {Assignee} from './assignee.schema';

export class UpdateAssigneeDto extends OmitType(Assignee, [
  'solution',
  'assignment',
] as const) {
}
