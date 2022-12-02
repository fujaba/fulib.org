import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsDateString, IsNotEmpty, IsOptional, IsString, IsUrl, Matches} from 'class-validator';
import {Document} from 'mongoose';

@Schema()
export class Project {
  _id!: string;

  @Prop({index: 1})
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon: string;

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

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  repository?: string;

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
