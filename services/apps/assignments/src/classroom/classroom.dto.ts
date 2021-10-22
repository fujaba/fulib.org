import {ApiProperty, PickType} from '@nestjs/swagger';
import {IsString} from 'class-validator';
import {CreateAssignmentDto} from '../assignment/assignment.dto';

export class ImportDto {
  @ApiProperty()
  @IsString()
  markdown: string;
}

export class ImportAssignmentDto extends PickType(CreateAssignmentDto, [
  'title',
  'description',
  'tasks',
]) {
}
