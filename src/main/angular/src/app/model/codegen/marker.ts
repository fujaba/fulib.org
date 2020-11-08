import {Position} from './position';

export interface Marker {
  severity: string;
  message: string;
  from: Position;
  to: Position;
}
