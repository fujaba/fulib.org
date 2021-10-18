export default class Task {
  _id: string;
  description: string;
  points: number;
  verification: string;

  // used during editing
  collapsed?: boolean;
  deleted?: boolean;
}
