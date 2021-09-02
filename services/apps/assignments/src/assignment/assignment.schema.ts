import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {Document} from 'mongoose';

export class Task {
  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Prop()
  @ApiProperty({minimum: 0})
  @IsNumber()
  @Min(0)
  points: number;

  @Prop()
  @ApiProperty()
  @IsString()
  verification: string;
}

@Schema()
export class Assignment {
  @Prop()
  @ApiProperty()
  token: string;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Prop()
  @ApiProperty()
  @IsString()
  description: string;

  @Prop()
  @ApiProperty()
  creator: string;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  author: string;

  @Prop()
  @ApiProperty()
  @IsEmail()
  email: string;

  @Prop()
  @ApiProperty({required: false})
  @IsOptional()
  @IsDateString()
  deadline?: Date;

  @Prop()
  @ApiProperty({type: [Task]})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Task)
  tasks: Task[];

  @Prop()
  @ApiProperty()
  @IsString()
  solution: string;

  @Prop()
  @ApiProperty()
  @IsString()
  templateSolution: string;
}

export type AssignmentDocument = Assignment & Document;

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
