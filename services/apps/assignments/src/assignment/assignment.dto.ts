import {ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {Assignment, Task} from './assignment.schema';

export class CreateAssignmentDto extends OmitType(Assignment, [
  'token',
  'createdBy',
] as const) {
}

export class ReadTaskDto extends OmitType(Task, ['verification'] as const) {
}

export class ReadAssignmentDto extends OmitType(Assignment, ['token', 'solution', 'tasks'] as const) {
  @ApiProperty({type: [ReadTaskDto]})
  tasks: ReadTaskDto[];
}

export class UpdateAssignmentDto extends PartialType(OmitType(Assignment, [
  'token',
  'createdBy',
] as const)) {
}
