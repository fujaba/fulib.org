import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssigneeModule} from '../assignee/assignee.module';
import {AssignmentModule} from '../assignment/assignment.module';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {SolutionAuthGuard} from './solution-auth.guard';
import {SolutionController} from './solution.controller';
import {SolutionHandler} from './solution.handler';
import {Solution, SolutionSchema} from './solution.schema';
import {SolutionService} from './solution.service';
import {FileModule} from "../file/file.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Solution.name,
        schema: SolutionSchema,
      },
    ]),
    AssignmentModule,
    forwardRef(() => EvaluationModule),
    AssigneeModule,
    FileModule,
  ],
  controllers: [SolutionController],
  providers: [
    SolutionService,
    SolutionHandler,
    SolutionAuthGuard,
  ],
  exports: [
    SolutionService,
    SolutionAuthGuard,
  ],
})
export class SolutionModule {
}
