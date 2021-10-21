import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {EvaluationModule} from '../evaluation/evaluation.module';
import {GradingSchema} from './grading.schema';
import {GradingService} from './grading.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'gradings',
        schema: GradingSchema,
      },
    ]),
    EvaluationModule,
  ],
  providers: [GradingService],
  exports: [
    GradingService,
  ],
})
export class GradingModule {
}
