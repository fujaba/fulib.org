import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsArray, IsDate, IsEmail, IsNumber, Min, ValidateNested} from 'class-validator';
import {Document} from 'mongoose';

export class Task {
  @Prop()
  @ApiProperty()
  description: string;

  @Prop()
  @ApiProperty({minimum: 0})
  @IsNumber()
  @Min(0)
  points: number;

  @Prop()
  @ApiProperty()
  verification: string;
}

@Schema()
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
  @IsEmail()
  email: string;

  @Prop()
  @ApiProperty()
  @IsDate()
  deadline: Date;

  @Prop()
  @ApiProperty({type: [Task]})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Task)
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
