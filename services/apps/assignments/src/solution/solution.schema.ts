import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Transform, Type} from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsHash,
  IsMongoId,
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
  @IsOptional()
  @IsBoolean()
  demonstration?: boolean;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  scientific?: boolean;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  '3P'?: boolean;
}

export class AuthorInfo {
  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studentId?: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @Transform(({value}) => value || undefined)
  email?: string;

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
