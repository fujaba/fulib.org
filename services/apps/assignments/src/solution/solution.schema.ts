import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {plainToInstance, Transform, Type} from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsHash,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {Types} from 'mongoose';
import {Doc, Ref} from "@mean-stream/nestx";

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

// TODO when merging frontend and backend, reuse and merge this with the frontend model
export class Feedback {
  @IsOptional()
  @IsIn([1, 2, 3, 4])
  appropriate?: number;

  @IsOptional()
  @IsIn([1, 2, 3, 4])
  helpful?: number;

  @IsOptional()
  @IsIn([1, 2, 3, 4])
  understandable?: number;
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
  @ApiProperty()
  _id: Types.ObjectId;

  @Prop()
  @ApiProperty()
  token: string;

  @Ref('Assignment', {index: 1})
  assignment: Types.ObjectId;

  @Prop({index: 1})
  @ApiProperty({required: false})
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @Prop()
  @ApiProperty()
  @ValidateNested()
  // Transform JSON strings to objects to support the multipart/form-data request with files
  @Transform(({value}) => typeof value === 'string' ? plainToInstance(AuthorInfo, JSON.parse(value)) : value)
  @Type(() => AuthorInfo)
  author: AuthorInfo;

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
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => Feedback)
  feedback?: Feedback;

  @Prop()
  @ApiPropertyOptional({description: ''})
  @IsNumber()
  points?: number;
}

export type SolutionDocument = Doc<Solution>;

export const SOLUTION_SORT = {
  'author.name': 1,
  'author.github': 1,
  timestamp: 1,
} as const;

export const SOLUTION_COLLATION = {
  locale: 'en',
  caseFirst: 'off',
} as const;

export const SolutionSchema = SchemaFactory.createForClass(Solution)
  .index({assignment: 1, ...SOLUTION_SORT}, {collation: SOLUTION_COLLATION})
;
