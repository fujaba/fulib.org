import {ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Solution} from "../solution/solution.schema";
import {Types} from "mongoose";

export class ImportSolution extends PickType(Solution, [
  'assignment',
  'timestamp',
  'commit',
  'author',
] as const) {
  @ApiPropertyOptional({type: String, format: 'objectid'})
  _id?: Types.ObjectId;
}
