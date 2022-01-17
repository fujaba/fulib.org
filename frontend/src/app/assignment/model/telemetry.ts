export interface Telemetry {
  assignment: string;
  solution?: string;
  evaluation?: string;
  task?: string;

  timestamp: Date;

  createdBy?: string;
  author?: string;

  action: string;
}

export type CreateTelemetryDto = Omit<Telemetry, 'assignment' | 'solution' | 'createdBy'>;
