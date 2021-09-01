import {OmitType, PartialType} from '@nestjs/swagger';
import {Solution} from './solution.schema';

export class CreateSolutionDto extends OmitType(Solution, [
  'token',
  'assignment',
  'userId',
  'timeStamp',
  'results',
] as const) {
}

export class UpdateSolutionDto extends PartialType(CreateSolutionDto) {
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
