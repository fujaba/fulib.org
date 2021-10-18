import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IS_ALPHA,
  IsAlphanumeric,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {Document} from 'mongoose';

export class Location {
  @Prop()
  @ApiProperty({type: 'integer', minimum: 0})
  @IsInt()
  @Min(0)
  line: number;

  @Prop()
  @ApiProperty({type: 'integer', minimum: 0})
  @IsInt()
  @Min(0)
  character: number;
}

export class Snippet {
  @Prop()
  @ApiProperty()
  @IsString()
  file: string;

  @Prop()
  @ApiProperty()
  @ValidateNested()
  @Type(() => Location)
  from: Location;

  @Prop()
  @ApiProperty()
  @ValidateNested()
  @Type(() => Location)
  to: Location;

  @Prop()
  @ApiProperty()
  @IsString()
  code: string;

  @Prop()
  @ApiProperty()
  @IsString()
  comment: string;
}

@Schema()
export class Annotation {
  @Prop()
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @Prop()
  @ApiProperty()
  @IsMongoId()
  solution: string;

  @Prop()
  @ApiProperty()
  @IsAlphanumeric()
  @IsNotEmpty()
  task: string;

  @Prop()
  @ApiProperty()
  @IsString()
  author: string;

  @Prop()
  @ApiProperty()
  @IsString()
  remark: string;

  @Prop()
  @ApiProperty()
  @IsNumber()
  points: number;

  @Prop()
  @ApiProperty({type: [Snippet]})
  @ValidateNested({each: true})
  @Type(() => Snippet)
  snippets: Snippet[];
}

export type AnnotationDocument = Annotation & Document;

export const AnnotationSchema = SchemaFactory.createForClass(Annotation)
  .index({assignment: 1, solution: 1})
  .index({assignment: 1, solution: 1, 'snippets.file': 1})
  .index({assignment: 1, solution: 1, task: 1})
;
