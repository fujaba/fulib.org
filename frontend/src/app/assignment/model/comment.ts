export default class Comment {
  _id?: string;
  assignment: string;
  solution: string;

  timestamp?: Date;

  createdBy?: string;
  author: string;
  email: string;

  body?: string;
  html?: string;

  distinguished?: boolean;
}
