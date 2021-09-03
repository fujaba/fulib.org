import {OmitType, PartialType} from '@nestjs/swagger';
import {Course} from './course.schema';

export class CreateCourseDto extends OmitType(Course, [
  'createdBy',
] as const) {
}

export class UpdateCourseDto extends PartialType(OmitType(Course, [
  'createdBy',
] as const)) {
}
