import {ApiProperty, OmitType, PartialType} from '@nestjs/swagger';
import {AuthorInfo} from '../solution/solution.schema';
import {Course} from './course.schema';

export class CreateCourseDto extends OmitType(Course, [
  'createdBy',
] as const) {
}

export class UpdateCourseDto extends PartialType(OmitType(Course, [
  'createdBy',
] as const)) {
}

export class CourseStudent {
  @ApiProperty()
  author: AuthorInfo;

  @ApiProperty()
  points: number[];

  @ApiProperty()
  solutions: string[];
}
