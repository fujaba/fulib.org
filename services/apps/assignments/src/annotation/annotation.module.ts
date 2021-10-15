import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AssignmentModule} from '../assignment/assignment.module';
import {SolutionModule} from '../solution/solution.module';
import {AnnotationController} from './annotation.controller';
import {AnnotationSchema} from './annotation.schema';
import {AnnotationService} from './annotation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: 'annotations',
      schema: AnnotationSchema,
    }]),
    AssignmentModule,
    SolutionModule,
  ],
  controllers: [AnnotationController],
  providers: [
    AnnotationService,
  ],
})
export class AnnotationModule {
}
