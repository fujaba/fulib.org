import {OmitType, PartialType} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {Solution} from './solution.schema';

const excluded = [
  'token',
  'assignment',
  'createdBy',
  'timestamp',
] as const;

export class CreateSolutionDto extends OmitType(Solution, [
  ...excluded,
  'points',
] as const) {
}

export class UpdateSolutionDto extends PartialType(OmitType(Solution, [
  ...excluded,
  'solution',
  'commit',
] as const)) {
}

export class ReadSolutionDto extends OmitType(Solution, [
  'token',
]) {
  _id: Types.ObjectId;
  /*
  @Prop()
  @ApiProperty()
  @IsString()
  assignee: string;
   */
}
