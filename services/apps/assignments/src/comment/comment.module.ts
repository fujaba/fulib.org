import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SolutionModule} from '../solution/solution.module';
import {CommentAuthGuard} from './comment-auth.guard';
import {CommentController} from './comment.controller';
import {CommentSchema} from './comment.schema';
import {CommentService} from './comment.service';

// TODO migration: comments { id -> _id, parent -> solution, - -> assignment, userId -> createdBy, timeStamp -> timestamp, markdown -> body, html -> - }

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'comments',
        schema: CommentSchema,
      },
    ]),
    AssignmentModule,
    SolutionModule,
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    CommentAuthGuard,
  ],
  exports: [
    CommentService,
    CommentAuthGuard,
  ],
})
export class CommentModule {
}
