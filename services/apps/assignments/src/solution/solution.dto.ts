import {OmitType, PartialType} from '@nestjs/swagger';
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
  /*
  @Prop()
  @ApiProperty()
  @IsString()
  assignee: string;
   */
}
