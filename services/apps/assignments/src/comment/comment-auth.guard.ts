import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {Request} from 'express';
import {notFound} from '@mean-stream/nestx';
import {CommentService} from './comment.service';

@Injectable()
export class CommentAuthGuard implements CanActivate {
  constructor(
    private commentService: CommentService,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const commentId = req.params.comment ?? req.params.id;
    const user = (req as any).user;
    const comment = await this.commentService.findOne(commentId) ?? notFound(commentId);
    return this.commentService.isAuthorized(comment, user);
  }
}
