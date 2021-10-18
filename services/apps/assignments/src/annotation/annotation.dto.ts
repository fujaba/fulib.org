import {PartialType} from '@nestjs/swagger';
import {OmitType} from '@nestjs/swagger';
import {Annotation} from './annotation.schema';

export class CreateAnnotationDto extends OmitType(Annotation, [
  'assignment',
  'solution',
] as const) {
}

export class UpdateAnnotationDto extends PartialType(CreateAnnotationDto) {
}
