import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {SolutionDocument} from '../solution/solution.schema';
import {CommentService} from './comment.service';

@Injectable()
export class CommentHandler {
  constructor(
    private commentService: CommentService,
  ) {
  }

  @OnEvent('solution.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.commentService.removeAll({assignment: solution.assignment, solution: solution._id});
  }
}
