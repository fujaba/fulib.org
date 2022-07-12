export default class Comment {
  _id?: string;
  assignment: string;
  solution: string;

  timestamp?: Date;

  createdBy?: string;
  author: string;
  email: string;

  body?: string;

  distinguished?: boolean;
}

export type CommentParent = Pick<Comment, 'assignment' | 'solution'>;

export interface CommentEvent {
  event: string;
  comment: Comment;
}
