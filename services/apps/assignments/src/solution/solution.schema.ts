import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsHash,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
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

export class Consent {
  @Prop()
  @ApiPropertyOptional()
  demonstration?: boolean;

  @Prop()
  @ApiPropertyOptional()
  scientific?: boolean;

  @Prop()
  @ApiPropertyOptional()
  '3P'?: boolean;
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
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => Consent)
  consent?: Consent;

  @Prop()
  @ApiPropertyOptional({description: ''})
  @IsNumber()
  points?: number;

  @Prop({required: false})
  results?: TaskResult[];
}

export type SolutionDocument = Solution & Document;

export const SolutionSchema = SchemaFactory.createForClass(Solution)
  .index({assignment: 1, 'author.name': 1})
  .index({assignment: 1, 'author.github': 1})
  .index({assignment: 1, 'timestamp': 1})
;
