export interface Position {
  line: number;
  ch: number;
}

export interface Marker {
  path?: string;
  severity: string;
  message: string;
  from: Position;
  to: Position;
}
