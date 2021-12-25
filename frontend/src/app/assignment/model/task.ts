export default class Task {
  _id: string;
  description: string;
  points: number;
  verification: string;
  glob?: string;
  children: Task[];

  // used during editing
  collapsed?: boolean;
  deleted?: boolean;
}
