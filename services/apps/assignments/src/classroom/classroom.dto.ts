import {ApiProperty} from "@nestjs/swagger";

export class ImportResult {
  @ApiProperty()
  length: number;

  @ApiProperty()
  tokens: number;

  @ApiProperty()
  estimatedCost: number;
}
