import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SearchModule} from '../search/search.module';
import {SolutionModule} from '../solution/solution.module';
import {EvaluationController} from './evaluation.controller';
import {EvaluationHandler} from './evaluation.handler';
import {Evaluation, EvaluationSchema} from './evaluation.schema';
import {EvaluationService} from './evaluation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Evaluation.name,
      schema: EvaluationSchema,
    }]),
    AssignmentModule,
    SolutionModule,
    SearchModule,
  ],
  controllers: [EvaluationController],
  providers: [
    EvaluationService,
    EvaluationHandler,
  ],
  exports: [
    EvaluationService,
  ],
})
export class EvaluationModule {
}
