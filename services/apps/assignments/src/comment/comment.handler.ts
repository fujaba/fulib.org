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

  @OnEvent('assignments.*.solutions.*.deleted')
  async onSolutionDeleted(solution: SolutionDocument) {
    await this.commentService.deleteMany({assignment: solution.assignment.toString(), solution: solution.id});
  }
}
