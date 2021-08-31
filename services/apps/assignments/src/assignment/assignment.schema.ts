import {Prop, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Document} from 'mongoose';

export class Task {
  @Prop()
  @ApiProperty()
  description: string;

  @Prop()
  @ApiProperty()
  points: number;

  @Prop()
  @ApiProperty()
  verification: string;
}

export class Assignment {
  @Prop()
  @ApiProperty()
  token: string;

  @Prop()
  @ApiProperty()
  title: string;

  @Prop()
  @ApiProperty()
  description: string;

  @Prop()
  @ApiProperty()
  userId: string;

  @Prop()
  @ApiProperty()
  author: string;

  @Prop()
  @ApiProperty()
  email: string;

  @Prop()
  @ApiProperty()
  deadline: Date;

  @Prop()
  @ApiProperty({ type: [Task] })
  tasks: Task[];

  @Prop()
  @ApiProperty()
  solution: string;

  @Prop()
  @ApiProperty()
  templateSolution: string;
}

export type AssignmentDocument = Assignment & Document;

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
