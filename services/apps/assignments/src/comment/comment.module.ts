import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SolutionModule} from '../solution/solution.module';
import {CommentAuthGuard} from './comment-auth.guard';
import {CommentController} from './comment.controller';
import {CommentHandler} from './comment.handler';
import {Comment, CommentSchema} from './comment.schema';
import {CommentService} from './comment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
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
    CommentHandler,
  ],
  exports: [
    CommentService,
    CommentAuthGuard,
  ],
})
export class CommentModule {
}
