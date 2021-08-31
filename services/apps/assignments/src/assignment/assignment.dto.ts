import {OmitType} from '@nestjs/swagger';
import {Assignment} from './assignment.schema';

export class CreateAssignmentDto extends OmitType(Assignment, [] as const) {
}

export class UpdateAssignmentDto extends OmitType(Assignment, [] as const) {
}
