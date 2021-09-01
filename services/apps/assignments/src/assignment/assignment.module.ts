import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentController} from './assignment.controller';
import {AssignmentSchema} from './assignment.schema';
import {AssignmentService} from './assignment.service';

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
})
export class AssignmentModule {
}