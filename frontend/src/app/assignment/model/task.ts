export default class Task {
  description: string;
  points: number;
  verification: string;

  // used during editing
  collapsed?: boolean;
  deleted?: boolean;
}
