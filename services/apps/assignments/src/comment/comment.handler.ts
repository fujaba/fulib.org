import {EventPayload} from '@app/event/event.interface';
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
  async onSolutionDeleted({data: solution}: EventPayload<SolutionDocument>) {
    await this.commentService.removeAll({assignment: solution.assignment, solution: solution.id});
  }
}
