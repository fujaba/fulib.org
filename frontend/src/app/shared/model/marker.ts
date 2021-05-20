export interface Position {
  line: number;
  ch: number;
}

export interface Marker {
  severity: string;
  message: string;
  from: Position;
  to: Position;
}
