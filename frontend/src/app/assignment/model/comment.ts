import {Resource} from '../../shared/live/repository';

export default class Comment {
  _id: string;
  assignment: string;
  solution: string;

  timestamp: Date;
  createdBy: string;
  distinguished: boolean;

  author: string;
  email: string;
  body: string;
}

export type CreateCommentDto = Omit<Comment, '_id' | 'assignment' | 'solution' | 'createdBy' | 'timestamp' | 'distinguished'>;
export type UpdateCommentDto = Partial<CreateCommentDto>;

export type CommentParent = Pick<Comment, 'assignment' | 'solution'>;

export interface CommentEvent {
  event: string;
  comment: Comment;
}

export interface CommentType extends Resource {
  parent: CommentParent;
  id: string;
  type: Comment;
  filter: never;
  create: CreateCommentDto;
  update: UpdateCommentDto;
  patch: UpdateCommentDto;
  event: CommentEvent;
}
