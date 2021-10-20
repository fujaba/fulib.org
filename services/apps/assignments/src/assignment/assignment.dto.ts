import {ApiProperty, OmitType, PartialType, PickType} from '@nestjs/swagger';
import {Solution, TaskResult} from '../solution/solution.schema';
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

export class CheckRequestDto extends PickType(Solution, ['solution'] as const) {
}

export class CheckResponseDto {
  @ApiProperty({type: [TaskResult]})
  results: TaskResult[];
}

export class CheckNewRequestDto extends PickType(Assignment, ['solution', 'tasks'] as const) {
}
