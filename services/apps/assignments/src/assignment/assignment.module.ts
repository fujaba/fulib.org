import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentController} from './assignment.controller';
import {AssignmentSchema} from './assignment.schema';
import {AssignmentService} from './assignment.service';

// TODO migration: assignments { id -> -, userId -> creator }

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
  providers: [AssignmentService],
  exports: [
    AssignmentService,
  ],
})
export class AssignmentModule {
}
