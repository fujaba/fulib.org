import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString, IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {Document} from 'mongoose';

export class TaskResult {
  @Prop()
  @ApiProperty()
  @Min(0)
  points: number;

  @Prop()
  @ApiProperty()
  @IsString()
  output: string;
}

export class AuthorInfo {
  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentID: string;

  @Prop()
  @ApiProperty()
  @IsEmail()
  email: string;

  @Prop()
  @ApiProperty()
  @IsOptional()
  @IsString()
  github?: string;
}

@Schema()
export class Solution {
  @Prop()
  @ApiProperty()
  token: string;

  @Prop({index: 1})
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @Prop()
  @ApiProperty({required: false})
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @Prop()
  @ApiProperty()
  @ValidateNested()
  @Type(() => AuthorInfo)
  author: AuthorInfo;

  @Prop()
  @ApiProperty()
  @IsString()
  solution: string;

  @Prop()
  @ApiProperty()
  @IsDateString()
  timestamp?: Date;

  @Prop()
  @ApiProperty({type: [TaskResult]})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => TaskResult)
  results: TaskResult[];
}

export type SolutionDocument = Solution & Document;

export const SolutionSchema = SchemaFactory.createForClass(Solution);
