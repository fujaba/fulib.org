import {ApiProperty} from "@nestjs/swagger";

export class ImportResult {
  @ApiProperty()
  length: number;
}
