import {ApiProperty, ApiPropertyOptional, OmitType, PartialType} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {Solution} from './solution.schema';
import {AsObjectId} from "@mean-stream/nestx";
import {IsOptional} from "class-validator";

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
  'commit',
] as const)) {
}

export class BatchUpdateSolutionDto extends UpdateSolutionDto {
  @IsOptional()
  @AsObjectId()
  @ApiPropertyOptional()
  _id?: Types.ObjectId;
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
