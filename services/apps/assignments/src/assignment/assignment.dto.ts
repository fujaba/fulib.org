import {ApiProperty, ApiPropertyOptional, OmitType, PartialType} from '@nestjs/swagger';
import {Equals, IsOptional} from 'class-validator';
import {Assignment, Task} from './assignment.schema';

export class CreateAssignmentDto extends OmitType(Assignment, [
  '_id',
  'token',
  'createdBy',
] as const) {
}

export class ReadTaskDto extends OmitType(Task, ['note', 'children'] as const) {
  @ApiProperty()
  children: ReadTaskDto[];
}

export class ReadAssignmentDto extends OmitType(Assignment, ['token', 'tasks', 'classroom', 'moss', 'openAI'] as const) {
  @ApiProperty({type: [ReadTaskDto]})
  tasks: ReadTaskDto[];
}

export class UpdateAssignmentDto extends PartialType(OmitType(Assignment, [
  '_id',
  'token',
  'createdBy',
] as const)) {
  @ApiPropertyOptional({description: 'If true, a new token is generated that replaces the old token.'})
  @IsOptional()
  @Equals(true)
  token?: true;
}
