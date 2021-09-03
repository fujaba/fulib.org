import {OmitType, PartialType} from '@nestjs/swagger';
import {Comment} from './comment.schema';

export class CreateCommentDto extends OmitType(Comment, [
  'assignment',
  'solution',
  'createdBy',
  'timestamp',
  'distinguished',
] as const) {
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
}
