export default class Comment {
  id?: string;

  parent: string;

  timeStamp?: Date;

  author: string;
  email: string;

  markdown: string;
  html?: string;
}
