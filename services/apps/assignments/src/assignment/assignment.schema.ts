import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Transform, Type} from 'class-transformer';
import {
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import {Types} from 'mongoose';
import {MOSS_LANGUAGES} from '../search/search.constants';
import {Doc} from '@mean-stream/nestx';
import {EMBEDDING_MODELS, EmbeddingModel} from '../embedding/openai.service';

@Schema({id: false, _id: false})
export class Task {
  @Prop()
  @ApiProperty()
  @IsAlphanumeric()
  @IsNotEmpty()
  _id: string;

  @Prop()
  @ApiProperty()
  @IsString()
  description: string;

  @Prop()
  @ApiProperty()
  @IsNumber()
  points: number;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  glob?: string;

  @Prop({default: []})
  @ApiProperty({type: [Task]})
  @ValidateNested({each: true})
  @Type(() => Task)
  children: Task[];
}

@Schema({id: false, _id: false})
export class ClassroomInfo {
  @Prop()
  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  org?: string;

  @Prop()
  @ApiProperty({required: false})
  @IsOptional()
  @IsString()
  prefix?: string;

  @Prop({transform: (v?: string) => v && '***'})
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({value}) => value === '***' ? undefined : value)
  token?: string;

  @Prop({transform: (v?: string) => v ? '***' : undefined})
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @Transform(({value}) => value === '***' ? undefined : value)
  webhook?: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  codeSearch?: boolean;
}

@Schema({id: false, _id: false})
export class MossConfig {
  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  userId?: number;

  @Prop({type: String})
  @ApiPropertyOptional({enum: Object.keys(MOSS_LANGUAGES)})
  @IsOptional()
  @IsIn(Object.keys(MOSS_LANGUAGES))
  language?: keyof typeof MOSS_LANGUAGES;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  result?: string;
}

@Schema({id: false, _id: false})
export class OpenAIConfig {

  @Prop({transform: (v?: string) => v && '***'})
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({value}) => value === '***' ? undefined : value)
  apiKey?: string;

  @Prop({type: String})
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.keys(EMBEDDING_MODELS))
  model?: EmbeddingModel;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ignore?: string;
}

@Schema()
export class Assignment {
  @ApiProperty({format: 'objectid'})
  _id: Types.ObjectId;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  archived?: boolean;

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

  @Prop({index: 1})
  @ApiPropertyOptional()
  createdBy?: string;

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
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(({value}) => typeof value === 'string' ? new Date(value) : value)
  issuance?: Date;

  @Prop({index: 1})
  @ApiProperty({required: false})
  @IsOptional()
  @IsDate()
  @Transform(({value}) => typeof value === 'string' ? new Date(value) : value)
  deadline?: Date;

  @Prop({type: ClassroomInfo})
  @ApiProperty({required: false})
  @IsOptional()
  @ValidateNested()
  @Type(() => ClassroomInfo)
  classroom?: ClassroomInfo;

  @Prop({type: MossConfig})
  @ApiProperty({required: false})
  @IsOptional()
  @ValidateNested()
  @Type(() => MossConfig)
  moss?: MossConfig;

  @Prop({type: OpenAIConfig})
  @ApiProperty({required: false})
  @IsOptional()
  @ValidateNested()
  @Type(() => OpenAIConfig)
  openAI?: OpenAIConfig;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  passingPoints?: number;

  @Prop()
  @ApiProperty({type: [Task]})
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => Task)
  tasks: Task[];
}

export type AssignmentDocument = Doc<Assignment>;

export const ASSIGNMENT_SORT = {
  title: 1,
} as const;

export const ASSIGNMENT_COLLATION = {
  locale: 'en',
  numericOrdering: true,
} as const;

export const AssignmentSchema = SchemaFactory.createForClass(Assignment)
  .index(ASSIGNMENT_SORT, {collation: ASSIGNMENT_COLLATION})
;
