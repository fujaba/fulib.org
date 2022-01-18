import {OmitType} from '@nestjs/swagger';
import {Telemetry} from './telemetry.schema';

export class CreateTelemetryDto extends OmitType(Telemetry, [
  'assignment',
  'solution',
  'createdBy',
] as const) {
}
