import {forwardRef, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SolutionModule} from '../solution/solution.module';
import {EvaluationController} from './evaluation.controller';
import {EvaluationSchema} from './evaluation.schema';
import {EvaluationService} from './evaluation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'evaluations',
      schema: EvaluationSchema,
    }]),
    AssignmentModule,
    forwardRef(() => SolutionModule),
  ],
  controllers: [EvaluationController],
  providers: [
    EvaluationService,
  ],
  exports: [
    EvaluationService,
  ],
})
export class EvaluationModule {
}
