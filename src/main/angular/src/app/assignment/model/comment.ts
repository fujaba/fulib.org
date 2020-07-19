export default class Comment {
  id?: string;

  parent: string;

  timeStamp?: Date;

  userId?: string;
  author: string;
  email: string;

  markdown: string;
  html?: string;

  distinguished?: boolean;
}
