import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsHash,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {Document} from 'mongoose';

export class TaskResult {
  @Prop()
  task: string;

  @Prop()
  points: number;

  @Prop()
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
  studentId: string;

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

  @Prop({index: 1})
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
  @ApiPropertyOptional()
  @IsOptional()
  @IsHash('sha1')
  commit?: string;

  @Prop()
  @ApiProperty()
  @IsDateString()
  timestamp?: Date;

  @Prop()
  results?: TaskResult[];
}

export type SolutionDocument = Solution & Document;

export const SolutionSchema = SchemaFactory.createForClass(Solution)
  .index({assignment: 1, 'author.github': 1})
;
