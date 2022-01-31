import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Transform} from 'class-transformer';
import {IsAlphanumeric, IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {Document} from 'mongoose';

@Schema()
export class Telemetry {
  @Prop()
  @ApiProperty()
  @IsMongoId()
  assignment: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  solution?: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsAlphanumeric()
  task?: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  evaluation?: string;

  @Prop()
  @ApiProperty()
  @IsDate()
  @Transform(({value}) => typeof value === 'string' ? new Date(value) : value)
  timestamp: Date;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  createdBy?: string;

  @Prop()
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;

  @Prop()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  action: string;
}

export type TelemetryDocument = Telemetry & Document;

export const TelemetrySchema = SchemaFactory.createForClass(Telemetry);
