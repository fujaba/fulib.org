import {ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {Assignment, Task} from './assignment.schema';

export class CreateAssignmentDto extends OmitType(Assignment, [] as const) {
}

export class FindAllTaskDto extends OmitType(Task, ['verification'] as const) {
}

export class FindAllAssignmentDto extends OmitType(Assignment, ['token', 'solution', 'tasks'] as const) {
  @ApiProperty({type: [FindAllTaskDto]})
  tasks: FindAllTaskDto[];
}

export class UpdateAssignmentDto extends PartialType(OmitType(Assignment, [] as const)) {
}
