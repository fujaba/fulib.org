import {PickType} from '@nestjs/swagger';
import {CreateAssignmentDto} from '../assignment/assignment.dto';

export class ImportAssignmentDto extends PickType(CreateAssignmentDto, [
  'title',
  'description',
  'tasks',
]) {
}
