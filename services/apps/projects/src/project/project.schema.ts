import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsDateString, IsNotEmpty, IsOptional, IsString, Matches} from 'class-validator';
import {Document} from 'mongoose';

@Schema()
export class Project {
  @Prop({index: 1})
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop()
  @ApiProperty()
  @IsString()
  description: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^(?:registry\.uniks\.de\/)?(fulib|codercom)\/code-server(?:-[a-zA-Z0-9-]+)?(?::[a-zA-Z0-9.-]+)?$/)
  dockerImage?: string;

  @Prop({index: 1})
  @ApiProperty()
  userId: string;

  @Prop()
  @ApiProperty()
  @IsDateString()
  created: Date;
}

export type ProjectDocument = Project & Document;

export const ProjectSchema = SchemaFactory.createForClass(Project)
  .set('toJSON', {virtuals: true})
;
