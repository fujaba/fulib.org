import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentAuthGuard} from './assignment-auth.guard';
import {AssignmentController} from './assignment.controller';
import {AssignmentSchema} from './assignment.schema';
import {AssignmentService} from './assignment.service';

// TODO migration: assignments { id -> _id, userId -> creator }

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'assignments',
        schema: AssignmentSchema,
      },
    ]),
  ],
  controllers: [AssignmentController],
  providers: [
    AssignmentService,
    AssignmentAuthGuard,
  ],
  exports: [
    AssignmentService,
    AssignmentAuthGuard,
  ],
})
export class AssignmentModule {
}
