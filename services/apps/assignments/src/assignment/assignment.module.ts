import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentAuthGuard} from './assignment-auth.guard';
import {AssignmentController} from './assignment.controller';
import {Assignment, AssignmentSchema} from './assignment.schema';
import {AssignmentService} from './assignment.service';
import {AssignmentMemberModule} from "../assignment-member/assignment-member.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Assignment.name,
        schema: AssignmentSchema,
      },
    ]),
    HttpModule,
    AssignmentMemberModule,
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
