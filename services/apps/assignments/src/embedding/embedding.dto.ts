import {ApiProperty, IntersectionType, PartialType, PickType} from "@nestjs/swagger";

export class EmbeddableBase {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  assignment: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  embedding: number[];
}

export class TaskEmbeddable extends EmbeddableBase {
  @ApiProperty()
  type: 'task';

  @ApiProperty()
  task: string;
}

export class SnippetEmbeddable extends EmbeddableBase {
  @ApiProperty()
  type: 'snippet';

  @ApiProperty()
  solution: string;

  @ApiProperty()
  file: string;

  @ApiProperty()
  line: number;

  @ApiProperty()
  column: number;
}

export type Embeddable = TaskEmbeddable | SnippetEmbeddable;

export class EmbeddableSearch extends IntersectionType(
  PickType(EmbeddableBase, ['assignment', 'embedding'] as const),
  PartialType(PickType(EmbeddableBase, ['type'] as const)),
) {
}
