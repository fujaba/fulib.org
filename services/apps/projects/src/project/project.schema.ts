import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {IsDateString, IsNotEmpty, IsString} from 'class-validator';
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

  @Prop({index: 1})
  @ApiProperty()
  userId: string;

  @Prop()
  @ApiProperty()
  @IsDateString()
  created: Date;
}

export type ProjectDocument = Project & Document;

export const ProjectSchema = SchemaFactory.createForClass(Project);
